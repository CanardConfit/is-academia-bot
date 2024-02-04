import * as fs from "fs";
import path from "node:path";
import * as schedule from "node-schedule";
import { env, loadEnv } from "./env";
import { gitHistory } from "./git-history";
import getIsAcademiaNotes from "./is-academia";
import { discord } from "./discord";
import { findDifferences, Module, parseJsonToModules } from "./modules";

loadEnv();

const notes = async () => {
  if (!fs.existsSync(env.CACHE_FOLDER)) {
    fs.mkdirSync(env.CACHE_FOLDER);
  }

  const tmpFile = path.join(env.CACHE_FOLDER, "tmpModuleFile.json");

  let oldModules: Module[] = [];

  if (env.GIT_ENABLED) {
    const gitFile = path.join(env.GIT_FOLDER, env.GIT_FILE);
    if (fs.existsSync(gitFile)) {
      oldModules = parseJsonToModules(fs.readFileSync(gitFile, "utf-8"));
    }
  }

  const newModules = await getIsAcademiaNotes(tmpFile);

  const differences = findDifferences(oldModules, newModules);

  if (env.GIT_ENABLED) {
    await gitHistory(env.GIT_FOLDER, tmpFile, env.GIT_FILE);
  }

  if (env.DISCORD_ENABLED) {
    discord(env.DISCORD_ID, env.DISCORD_TOKEN, differences);
  }
};

schedule.scheduleJob("0 * * * *", async () => {
  try {
    await notes();
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de l'exécution de la tâche asynchrone :",
      error,
    );
  }
});
console.log(
  "Le cron est prêt. La tâche sera exécutée toutes les heures à l'heure pile.",
);
