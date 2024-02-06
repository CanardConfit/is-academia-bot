import * as fs from "fs";
import path from "node:path";
import { simpleGit, SimpleGit } from "simple-git";
import { format } from "date-fns";
import { logger } from "./logger";

export const gitHistory = async (
  gitFolder: string,
  tmpFile: string,
  fileName: string,
  remoteUrl: string,
  branchName: string,
): Promise<boolean> => {
  /*
   * Create Git Folder
   */
  if (!fs.existsSync(gitFolder)) {
    fs.mkdirSync(gitFolder, { recursive: true });
    logger.info("Git folder created.");
  }

  const git: SimpleGit = simpleGit(gitFolder, { binary: "git" });

  /*
   * Init Git Repo if not exist
   */
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    await git.init();
    logger.info("Initialized a new git repository.");
  }

  /*
   * Change or add remote if not exist
   */
  const remotes = await git.getRemotes(true);
  const origin = remotes.find((remote) => remote.name === "origin");
  if (!origin || origin.refs.fetch !== remoteUrl || origin.refs.push !== remoteUrl) {
    if (origin) {
      await git.removeRemote("origin");
    }
    await git.addRemote("origin", remoteUrl);
    logger.info(`Remote 'origin' set to ${remoteUrl}.`);
  }

  /*
   * Fetch, switch or create branch if config change
   */
  await git.fetch();
  const branchExists = await git
    .branchLocal()
    .then((result) => result.all.includes(branchName));
  if (!branchExists) {
    await git.checkoutLocalBranch(branchName);
    logger.info(`Created and switched to branch '${branchName}'.`);
  } else {
    await git.checkout(branchName);
    logger.info(`Switched to branch '${branchName}'.`);
    await git.pull("origin", branchName);
    logger.info(`Pulled latest changes from 'origin/${branchName}'.`);
  }

  /*
   * Add file to git repo
   */
  const file = path.join(gitFolder, fileName);
  fs.copyFileSync(tmpFile, file, fs.constants.COPYFILE_FICLONE);
  logger.info("Copied temporary file to the git folder.");
  await git.add(fileName);

  /*
   * Commit and push changes
   */
  const response = await git.commit(
    `Update ${format(new Date(), "yyyy-MM-dd-HH-mm")}`,
  );
  await git.push("origin", branchName);
  logger.info(
    "Changes have been committed and pushed to the remote repository.",
  );

  return response.summary.changes > 0;
};
