# syntax=docker/dockerfile:1.2
# e.g.: `docker build --rm --build-arg "FROM_IMAGE=node:24-trixie-slim" -f ./Dockerfile .`
ARG FROM_IMAGE

FROM ${FROM_IMAGE}

RUN set -x && apt-get update && apt-get -yq install bash git curl unzip gnupg
RUN curl https://get.volta.sh | bash
RUN ~/.volta/bin/node -v || (~/.volta/bin/volta install node@24 && ~/.volta/bin/node -v)
RUN useradd admin -m \
    && echo admin | passwd admin --stdin \
    && usermod -aG sudo admin
RUN curl -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh \
    && chmod +x install-opentofu.sh \
    && ./install-opentofu.sh --install-method standalone \
    && rm -f install-opentofu.sh
RUN curl -sSLo ./terraform-docs.tar.gz https://terraform-docs.io/dl/v0.21.0/terraform-docs-v0.21.0-$(uname)-amd64.tar.gz \
    && tar -xzf terraform-docs.tar.gz \
    && chmod +x terraform-docs \
    && mv terraform-docs /usr/local/bin/
RUN ~/.volta/bin/npm i -g bun && ~/.volta/bin/npm i -g pnpm && ssh-keygen -A
COPY sshd-actions.conf /etc/ssh/sshd_config.d/sshd-actions.conf
RUN apt-get -yq install openssh-server \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

