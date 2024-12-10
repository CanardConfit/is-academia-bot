import * as fs from "fs";
import path from "node:path";
import * as schedule from "node-schedule";
import { env, loadEnv } from "./env";
import { gitHistory } from "./git-history";
import getIsAcademiaNotes from "./is-academia";
import { discord } from "./discord";
import { findDifferences, Module, parseJsonToModules } from "./modules";
import { logger } from "./logger";
import { telegramSendUpdates } from "./telegram";
loadEnv();

const notes = async () => {
    logger.info("Starting the notes processing task.");

    const gitFolder = "git-history";

    if (!fs.existsSync(env.CACHE_FOLDER)) {
        fs.mkdirSync(env.CACHE_FOLDER, { recursive: true });
        logger.info(`Created cache folder at: ${env.CACHE_FOLDER}`);
    }

    const tmpFile = path.join(env.CACHE_FOLDER, "tmpModuleFile.json");

    const newModules = await getIsAcademiaNotes(tmpFile);
    logger.info("Retrieved new modules from IsAcademia.");

    let oldModules: Module[] = [];

    if (env.GIT_ENABLED) {
        const gitFile = path.join(gitFolder, env.GIT_FILE);
        if (fs.existsSync(gitFile)) {
            oldModules = parseJsonToModules(fs.readFileSync(gitFile, "utf-8"));
            logger.info("Loaded old modules from the git repository.");
        } else {
            logger.info("File doesn't exist, it will be created.");
            fs.copyFileSync(tmpFile, gitFile);
        }
    }

    const differences = findDifferences(oldModules, newModules);
    if (env.GIT_ENABLED) {
        await gitHistory(gitFolder, tmpFile);
        logger.info("Updated git history with new modules.");
    }

    if (differences.length === 0) {
        logger.info("No differences found between old and new modules. No notifications sent.");
    } else {
        logger.info("Found differences between old and new modules.");

        if (env.DISCORD_ENABLED) {
            logger.info("Sending differences to Discord service.");
            discord(env.DISCORD_ID, env.DISCORD_TOKEN, differences);
        }

        if (env.TELEGRAM_ENABLED) {
            logger.info("Sending differences to Telegram service.");
            telegramSendUpdates(env.TELEGRAM_TOKEN, env.TELEGRAM_CHAT_ID, differences);
        }
    }
};

schedule.scheduleJob("0 * * * *", async () => {
    try {
        logger.info("Scheduled task started.");
        await notes();
    } catch (error) {
        logger.error("An error occurred during the execution of the scheduled task:", error);
    }
});
logger.info("Cron job setup complete. The task will run hourly on the hour.");

void notes().then(() => logger.info("Initial notes processing task completed."));
