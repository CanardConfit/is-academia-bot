FROM ghcr.io/puppeteer/puppeteer:21.5.2 as base-amd64
FROM canardconfit/puppeteer-docker:puppeteer-21.5.2-arm64 as base-arm64

FROM base-${TARGETARCH}

LABEL org.opencontainers.image.authors = "CanardConfit"
LABEL org.opencontainers.image.source = "https://github.com/CanardConfit/is-academia-bot"
LABEL org.opencontainers.image.description = "IS-Academia Bot for HEPIA"

USER root

RUN apt-get install -y git

WORKDIR /home/pptruser

#USER pptruser

COPY package.json yarn.lock ./

RUN yarn

COPY . ./

RUN yarn build

RUN git config --global --add safe.directory '*'

VOLUME ["/app/git-history"]

CMD ["yarn", "start"]