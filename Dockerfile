FROM canardconfit/puppeteer-docker:latest

LABEL org.opencontainers.image.authors = "CanardConfit"
LABEL org.opencontainers.image.source = "https://github.com/CanardConfit/is-academia-bot"
LABEL org.opencontainers.image.description = "IS-Academia Bot for HEPIA"

WORKDIR /app

USER root

RUN apt-get install -y git

COPY package.json yarn.lock ./

RUN yarn

COPY . ./

RUN yarn build

RUN git config --global --add safe.directory '*'

VOLUME ["/app/git-history"]

CMD ["yarn", "start"]