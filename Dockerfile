FROM ghcr.io/puppeteer/puppeteer:latest

USER root

RUN apt-get install -y git

WORKDIR /app

COPY . /app/

RUN npm install

ARG GIT_USERNAME
ARG GIT_PASSWORD
RUN git config --global credential.helper '!f() { echo "username=${GIT_USERNAME}"; echo "password=${GIT_PASSWORD}"; }; f'

RUN npm run build

CMD ["npm", "start"]