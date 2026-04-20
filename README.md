# Motiviation

Auxiliary commands for CI/CD.

## Installed applications

Commands available in the image:

- `git`
- `curl`
- `bash`
- `/root/.volta/bin/volta`: volta
- `/root/.volta/bin/node`: Node v24
- `/root/.volta/bin/npm`: npm
- `/root/.volta/bin/bun`: bun
- `openssh`, login `admin:admin`
- `tofu`: OpenTofu - like Terraform, but MPL 2.0 license
- `terraform-docs`

The image is based on the Debian OS (trixie).

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
$ docker run skipero/neat-ci /root/.volta/bin/bunx -v
```

Or using with `docker-compose.yml`:

```yml
services:
  node:
    image: skipero/neat-ci:latest
    volumes:
      - ./src:/app:rw
    working_dir: /app
    command: []
```

SSH into container with username:password `admin:admin`.

[docker-hub]:(https://hub.docker.com/r/skipero/neat-ci)
[ghcr-io]:(https://ghcr.io/keenrouter/neat-ci)

