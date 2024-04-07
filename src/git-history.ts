import * as fs from "fs";
import path from "node:path";
import {CheckRepoActions, simpleGit, SimpleGit} from "simple-git";
import { format } from "date-fns";
import { env } from "./env";
import { logger } from "./logger";

function transformGitUrl(username: string, password: string, repoUrl: string) {
  try {
    const parsedUrl = new URL(repoUrl);

    parsedUrl.username = encodeURIComponent(username);
    parsedUrl.password = encodeURIComponent(password);

    return parsedUrl.href;
  } catch (error) {
    logger.error("Error transforming Git URL:", error);
    return "";
  }
}

export const gitHistory = async (
  gitFolder: string,
  tmpFile: string,
): Promise<boolean> => {
  /*
   * Ensure Git folder exists
   */
  if (!fs.existsSync(gitFolder)) {
    logger.info(`Git folder (${gitFolder}) must exist on your local machine.`);
    return false;
  }

  const git: SimpleGit = simpleGit(gitFolder, {
    binary: "git",
  });

  /*
   * Init Git Repo if not exist
   */
  const isRepo = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);
  if (!isRepo) {
    await git.init();
    logger.info("Initialized a new git repository.");
  }

  await git
    .addConfig("user.name", "Is-Academia-Bot")
    .addConfig("user.email", "noreply@github.com");

  /*
   * Change or add remote if not exist
   */
  const remoteURL = transformGitUrl(
    env.GIT_USERNAME,
    env.GIT_PASSWORD,
    env.GIT_REMOTE,
  );

  const remotes = await git.getRemotes(true);
  const origin = remotes.find((remote) => remote.name === "origin");
  if (
    !origin ||
    origin.refs.fetch !== remoteURL ||
    origin.refs.push !== remoteURL
  ) {
    if (origin) {
      await git.removeRemote("origin");
    }
    await git.addRemote("origin", remoteURL);
    logger.info(`Remote 'origin' set to ${remoteURL}.`);
  }

  /*
   * Fetch, switch or create branch if config change
   */
  await git.fetch();
  const branchExists = await git
    .branchLocal()
    .then((result) => result.all.includes(env.GIT_BRANCH));
  if (!branchExists) {
    await git.checkoutLocalBranch(env.GIT_BRANCH);
    logger.info(`Created and switched to branch '${env.GIT_BRANCH}'.`);
  } else {
    await git.checkout(env.GIT_BRANCH);
    logger.info(`Switched to branch '${env.GIT_BRANCH}'.`);
    await git.pull("origin", env.GIT_BRANCH);
    logger.info(`Pulled latest changes from 'origin/${env.GIT_BRANCH}'.`);
  }

  /*
   * Add file to git repo
   */
  const file = path.join(gitFolder, env.GIT_FILE);
  fs.copyFileSync(tmpFile, file, fs.constants.COPYFILE_FICLONE);
  logger.info("Copied temporary file to the git folder.");
  await git.add(env.GIT_FILE);

  /*
   * Commit and push changes
   */
  const response = await git.commit(
    `Update ${format(new Date(), "yyyy-MM-dd-HH-mm")}`,
  );
  await git.push("origin", env.GIT_BRANCH);
  logger.info(
    "Changes have been committed and pushed to the remote repository.",
  );

  return response.summary.changes > 0;
};
