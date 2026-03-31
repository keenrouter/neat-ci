const { fetchImageTagInfo, getEnv, shouldBePermitted } = require('./utils')

/**
 * @param {Object} github Docs: <https://octokit.github.io/rest.js/v18>
 * @param {Object} context Docs: <https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts>
 * @param {Object} core Docs: <https://github.com/actions/toolkit/tree/main/packages/core>
 * @return {Promise<{include: Object[]}>}
 */
module.exports = async ({github, context, core}) => {
  const env = {
    tagsMap: getEnv('tags-map').split('\n')
      .map(s => s.trim())
      .filter(s => {
        if (s.length === 0) { return false }
        return !(s.startsWith('//') || s.startsWith('#')) // skip the commented lines
      })
      .reduce((acc, curr) => {
        const pair = curr.split(':');
        if(pair.length>1){
          acc[pair[0]] = pair[1];
        }
        return acc
      }, {}),
    sourceImage: getEnv('source-image'),
    targetImage: getEnv('target-image'),
  }

  if (env.tagsMap.length === 0) {
    throw new Error('Empty tags list. Set required tag list using step "env.tags-map" key')
  } else if (env.sourceImage.length === 0) {
    throw new Error('Source image is not set. Set it using "env.source-image" key')
  } else if (env.targetImage.length === 0) {
    throw new Error('Target image is not set. Set it using "env.target-image" key')
  }

  core.info(`Tags list: ${JSON.stringify(env.tagsMap)}`)
  core.info(`Source image: ${env.sourceImage}, target image: ${env.targetImage}`)

  return await Promise.allSettled(Object.entries(env.tagsMap).map(([k, v], i) => {
    return new Promise((resolve, reject) => {
      fetchImageTagInfo(env.sourceImage, v)
        .then(sourceImageInfo => {
          fetchImageTagInfo(env.targetImage, k)
            .then(targetImageInfo => {
              const timeDeltaMillis = sourceImageInfo.pushedAt.getTime() - targetImageInfo.pushedAt.getTime()

              core.info(`Time difference between source (${k}) and target (${v}) images: ${timeDeltaMillis / 1000} sec.`)

              if (targetImageInfo.pushedAt.getTime() < sourceImageInfo.pushedAt.getTime()) {
                core.info(`Plan to build an image with the tag ${k} (time delta ${timeDeltaMillis / 1000} sec)`)

                return resolve({targetTag: k, sourceImage: sourceImageInfo}) // source image has a more recent update date - process it
              } else {
                core.warning(`Rebuilding the target tag ${k}`);
                return resolve({targetTag: k, sourceImage: sourceImageInfo})
              }

              //reject(new Error(`The image tag ${k} already updated - skip it`))
            })
            .catch(_ => {
              resolve({targetTag: k, sourceImage: sourceImageInfo}) // we have no this tag in the target repository, and therefore must process it
            })
        })
        .catch(reject)
    })
  })).then(async (promisesList) => {
    // matrix docs: <https://git.io/JKOdR>
    /** @type {{include: {targetTag: string, sourceTag: string, platforms: string}[]}} */
    const matrix = {include: []}

    promisesList.forEach(promise => {
      if (promise.status === 'fulfilled') {
        /** @type {{targetTag: string, sourceImage: {tag: string, arch: string[]}}} */
        const result = promise.value;
        /** @type {{tag: string, arch: string[]}} */
        const image = result.sourceImage;

        image.arch = image.arch.filter(arch => {
          /*
          const should = shouldBeIgnored(image.tag, arch)
          if (should === true) {
            core.info(`Architecture ${arch} for the tag ${image.tag} ignored (rule from the ignore-list)`)
          }
          return !should
          */
          return shouldBePermitted(image.tag, arch);
        })

        if (image.arch.length !== 0) {
          matrix.include.push({
            targetTag: result.targetTag,
            sourceTag: image.tag,
            platforms: image.arch.join(','),
          })
        } else {
          core.notice(`Tag ${image.tag} ignored (it does not contain the architectures)`)
        }
      } else {
        core.notice(promise.reason.message)
      }
    })

    if (matrix.include.length === 0) {
      core.warning('Nothing to do (empty matrix items)')

      // await github.rest.actions.cancelWorkflowRun({
      //   owner: context.repo.owner,
      //   repo: context.repo.repo,
      //   run_id: context.runId,
      // })
    }

    if (matrix.include.length > 255) { // maximal matrix size is 256 jobs per run: <https://git.io/JKZDZ>
      core.notice(`Matrix size limited (was: ${matrix.include.length}, become: 255)`)

      matrix.include = matrix.include.slice(0, 255)
    }

    return matrix
  })
}
