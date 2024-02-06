# IS-Academia Bot

IS-Academia Bot is an automated tool designed to fetch, analyze, and report changes in course modules from the IS-Academia platform, commonly used by academic institutions to manage course registrations, grades, and schedules. This bot simplifies tracking changes in course details, offering notifications through Discord and updates via a Git repository.

## Features

odule Tracking: Automatically tracks changes in course modules.
Discord Notifications: Sends updates directly to a specified Discord channel.
Git Version Control: Maintains a version-controlled history of module changes.
Flexible Configuration: Customizable to monitor specific courses or semesters.

## How It Works

IS-Academia Bot scrapes the IS-Academia webpage for the specified courses or modules, compares the fetched data with the previously stored state, and identifies any changes. On detecting updates, it commits these changes to a Git repository and optionally sends notifications through Discord.

## Installation

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Docker (optional for Docker-based installation)

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

1. Ensure Docker is installed and running on your system.
2. Build the Docker image:

```bash
docker build -t is-academia-bot .
```
3. Run the bot inside a Docker container. Make sure to mount the .env file or pass environment variables accordingly:

```bash
docker run --name is-academia-bot -d is-academia-bot
```
## Configuration

Configure the bot by editing the .env file. Essential configurations include:

- **SWITCH_USERNAME** and **SWITCH_PASSWORD** for IS-Academia login.
- **DISCORD_ID** and **DISCORD_TOKEN** for Discord notifications.
- **GIT_REMOTE**, **GIT_BRANCH**, **GIT_FOLDER** and **GIT_FILE** for Git repository details.

For more details on configuration options, refer to the `.env.example` file.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests with your improvements. For major changes, open an issue first to discuss what you would like to change.

## License

MIT License