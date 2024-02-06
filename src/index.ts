import * as fs from "fs";
import path from "node:path";
import * as schedule from "node-schedule";
import { env, loadEnv } from "./env";
import { gitHistory } from "./git-history";
import getIsAcademiaNotes from "./is-academia";
import { discord } from "./discord";
import { findDifferences, Module, parseJsonToModules } from "./modules";
import { logger } from "./logger";

loadEnv();

const notes = async () => {
  logger.info("Starting the notes processing task.");
  if (!fs.existsSync(env.CACHE_FOLDER)) {
    fs.mkdirSync(env.CACHE_FOLDER, { recursive: true });
    logger.info(`Created cache folder at: ${env.CACHE_FOLDER}`);
  }

  const tmpFile = path.join(env.CACHE_FOLDER, "tmpModuleFile.json");

  let oldModules: Module[] = [];

  if (env.GIT_ENABLED) {
    const gitFile = path.join(env.GIT_FOLDER, env.GIT_FILE);
    if (fs.existsSync(gitFile)) {
      oldModules = parseJsonToModules(fs.readFileSync(gitFile, "utf-8"));
      logger.info("Loaded old modules from the git repository.");
    }
  }

  const newModules = await getIsAcademiaNotes(tmpFile);
  logger.info("Retrieved new modules from IsAcademia.");

  const differences = findDifferences(oldModules, newModules);

  if (differences.length > 0) {
    logger.info("Found differences between old and new modules.");
  } else {
    logger.info("No differences found between old and new modules.");
  }

  if (env.GIT_ENABLED) {
    await gitHistory(
      env.GIT_FOLDER,
      tmpFile,
      env.GIT_FILE,
      env.GIT_REMOTE,
      env.GIT_BRANCH,
    );
    logger.info("Updated git history with new modules.");
  }

  if (env.DISCORD_ENABLED) {
    logger.info("Sent differences to Discord.");
    discord(env.DISCORD_ID, env.DISCORD_TOKEN, differences);
  }
};

schedule.scheduleJob("0 * * * *", async () => {
  try {
    logger.info("Scheduled task started.");
    await notes();
  } catch (error) {
    logger.error(
      "An error occurred during the execution of the scheduled task:",
      error,
    );
  }
});
logger.info("Cron job setup complete. The task will run hourly on the hour.");

void notes().then(() =>
  logger.info("Initial notes processing task completed."),
);
