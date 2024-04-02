# IS-Academia Bot

![Docker Pulls](https://img.shields.io/docker/pulls/canardconfit/is-academia-bot)
![GitHub Release](https://img.shields.io/github/v/release/CanardConfit/is-academia-bot)
![GitHub Repo stars](https://img.shields.io/github/stars/CanardConfit/is-academia-bot)

## Introduction

IS-Academia Bot is an automated tool designed to fetch, analyze, and report changes in course modules from the IS-Academia platform, commonly used by 
academic institutions to manage course registrations, grades, and schedules.
This bot simplifies tracking changes in course details, offering notifications through various channels and updates via a Git repository.

> **Note**: This bot is currently designed to work with the HES-SO website (https://age.hes-so.ch) and the SWITCH Edu-Id connection. If you are not within these settings, you may need to modify the program to make this work for you.

## Table of Contents

- [Introduction](#Introduction)
- [Installation](#Installation)
  - [Local Installation](#Local-Installation)
  - [Installation with Docker](#Installation-with-Docker)
- [Environment Configuration](#Environment-Configuration)
- [Features](#Features)
- [How It Works](#How-It-Works)
- [Contributing](#Contributing)
- [License](#License)


## Installation

### Local Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/IS-Academia-Bot.git
cd IS-Academia-Bot
```

2. Install dependencies:

```bash
npm install
# or, if you use yarn
yarn install
```

3. Configure the .env file with your IS-Academia credentials, Discord webhook, and other settings. Refer to the provided .env.example for guidance.
4. Run the bot:

```bash
npm start
# or, if you use yarn
yarn start
```

### Installation with Docker

The Docker image can be pulled from Docker Hub, here (ghcr.io) or Quay.io:
```sh
# Docker Hub
docker pull canardconfit/is-academia-bot

# ghcr.io
docker pull ghcr.io/canardconfit/is-academia-bot

# Quay.io
docker pull quay.io/canardconfit/is-academia-bot
```

Docker compose file:
```yml
version: '3'

services:
  is-academia-bot:
    image: canardconfit/is-academia-bot:latest
    container_name: is-academia-bot
    restart: always
    volumes:
      - "./git-history:/app/git-history"
    env_file:
      - "./environment.env"
```

> **Note**: Create `environment.env` file with a copy of .env.example

From file [docker-compose.yml](./docker-compose.yml).

## Environment Configuration

Configure the bot by editing the .env file. Essential configurations include:

- **SWITCH_USERNAME** and **SWITCH_PASSWORD** for IS-Academia login.
- **GIT_REMOTE**, **GIT_BRANCH**, **GIT_FOLDER** and **GIT_FILE** for Git repository details.
- **DISCORD_ID** and **DISCORD_TOKEN** for Discord notifications.
- **TELEGRAM_TOKEN** and **TELEGRAM_CHAT_ID** for Telegram notifications.

For more details on configuration options, refer to the `.env.example` file.

## Features

Module Tracking: Automatically tracks changes in course modules.

Git Version Control: Maintains a version-controlled history of module changes.

Flexible Configuration: Customizable to monitor specific courses or semesters.

Notification Support: Sends notifications through different channels :

- Discord via Webhook
- Telegram via Bot API

## How It Works

IS-Academia Bot scrapes the IS-Academia webpage for the specified courses or modules, compares the fetched data with the previously stored state, and identifies any changes.
On detecting updates, it commits these changes to a Git repository and optionally sends notifications through the configured channels.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests with your improvements. For major changes, open an issue first to discuss what you would like to change.

## License

[Apache 2.0 License](./LICENSE)
