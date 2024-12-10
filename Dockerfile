FROM ghcr.io/puppeteer/puppeteer:23.10.1 AS base-amd64
FROM canardconfit/puppeteer-docker:puppeteer-23.10.1-arm64 AS base-arm64

FROM base-${TARGETARCH}

LABEL org.opencontainers.image.authors="CanardConfit" \
      org.opencontainers.image.source="https://github.com/CanardConfit/is-academia-bot" \
      org.opencontainers.image.description="IS-Academia Bot for HEPIA"

USER root

RUN apt update && \
    apt install -y git

WORKDIR /home/pptruser

#USER pptruser

COPY package.json yarn.lock ./

RUN yarn

COPY . ./

RUN yarn build && \
    git config --global --add safe.directory '*'

VOLUME ["/app/git-history"]

CMD ["yarn", "start"]
