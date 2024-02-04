import * as fs from "fs";
import path from "node:path";
import { simpleGit, SimpleGit } from "simple-git";
import { format } from "date-fns";

/* eslint-disable */
export const gitHistory = async (
  gitFolder: string,
  tmpFile: string,
  fileName: string,
): Promise<boolean> => {
  if (!fs.existsSync(gitFolder)) {
    console.error("Git Folder doesn't exist");
    return false;
  }

  const git: SimpleGit = simpleGit(gitFolder, { binary: "git" });

  await git.pull();

  const file = path.join(gitFolder, fileName);

  fs.copyFileSync(tmpFile, file, fs.constants.COPYFILE_FICLONE);

  await git.add(fileName);
  const response = await git.commit(`Update ${format(new Date(), "yyyy-MM-dd-HH")}`);
  await git.push();

  return response.summary.changes > 0;
};
/* eslint-enable */
