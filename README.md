# Motiviation

Auxiliary commands for CI/CD.

## Installed applications

Commands available in the image:

- `git`
- `curl`
- `bash`
- `node` v24
- `npm`
- `pnpm`
- `bun`
- `volta`
- `openssh`, log-in with `admin:admin`
- `tofu`, OpenTofu - like Terraform, but with MPL 2.0 license
- `terraform-docs`

> The image is based on the Debian OS (trixie).

### Docker registries:

You can check all existing tags in one of the following docker-registries:

| Registry                 | Image                       |
|--------------------------|-----------------------------|
| [Docker Hub][docker-hub] | `skipero/neat-ci`           |
| [ghcr.io][ghcr-io]       | `ghcr.io/keenrouter/neat-ci`|

Supported architectures:
- linux/amd64


## Supported tags

- `latest`
- `1`


## How can I use this?

For example:

```sh
$ docker run --rm \
    --volume "$(pwd):/app" \
    --workdir "/app" \
    --user "$(id -u):$(id -g)" \
    skipero/neat-ci:latest \
    bun --version
```

Or using with `docker-compose.yml`:

```yml
services:
  node:
    image: skipero/neat-ci:1
    volumes:
      - ./src:/app:rw
    working_dir: /app
    command: []
```

SSH into container with username:password `admin:admin`.

[docker-hub]:(https://hub.docker.com/r/skipero/neat-ci)
[ghcr-io]:(https://ghcr.io/keenrouter/neat-ci)

