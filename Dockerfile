FROM ghcr.io/puppeteer/puppeteer:latest

LABEL org.opencontainers.image.authors = "CanardConfit"
LABEL org.opencontainers.image.source = "https://github.com/CanardConfit/is-academia-bot"
LABEL org.opencontainers.image.description = "IS-Academia Bot for HEPIA"

WORKDIR /app

USER root

RUN apt-get install -y git

COPY package.json yarn.lock ./

RUN yarn

COPY . ./

ARG GIT_USERNAME
ARG GIT_PASSWORD

RUN git config --global credential.helper '!f() { echo "username=${GIT_USERNAME}"; echo "password=${GIT_PASSWORD}"; }; f'

RUN yarn build

RUN chown pptruser:pptruser -R /app

RUn chmod 755 -R /app

USER pptruser

CMD ["yarn", "start"]