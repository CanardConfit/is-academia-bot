import puppeteer from "puppeteer";
import { randomInt } from "node:crypto";
import { TOTP } from "totp-generator";
import { env } from "./env";
import { Module, parse } from "./modules";
import fs from "fs";

function delay(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function humanDelay(): Promise<void> {
  const time = randomInt(1, 3) * 1000;
  return delay(time);
}

const getIsAcademiaNotes = async (
  tmpFile: string,
  writeTmpFile: boolean = true,
): Promise<Module[]> => {
  const browser = await puppeteer.launch({
    headless: "new",
    /*args: [`--window-size=1920,1080`],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },*/
  });
  const page = (await browser.pages())[0];

  await page.goto("https://age.hes-so.ch/");

  await humanDelay();

  await page.select("#user_idp", "https://aai-logon.hes-so.ch/idp/shibboleth");

  await humanDelay();

  await page.click("#wayf_submit_button");

  await humanDelay();

  await page.type("#username", env.SWITCH_USERNAME);

  await humanDelay();

  await page.click("#login-button");

  await humanDelay();

  await page.type("#password", env.SWITCH_PASSWORD);

  await humanDelay();

  await page.click("#login-button");

  await humanDelay();

  if ((await page.$("#otp")) !== null) {
    const { otp } = TOTP.generate(env.SWITCH_TOTP_SECRET);

    await page.type("#otp", otp);

    await humanDelay();

    await page.click("#login-button");

    await humanDelay();
  }

  await humanDelay();

  const button0 = (await page.$x("//li[@id='410']"))[0];

  if (button0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await button0.click();
  }

  await humanDelay();

  const button1 = (
    await page.$x(
      "//a[contains(text(), 'Informatique et systèmes de communication, Plein temps, 2023-2024, S1')]",
    )
  )[0];

  if (button1) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await button1.click();
  }

  await humanDelay();

  const tableHTML = await page.$eval(
    "table[class=cc-inscr-matieres]",
    (element) => element.outerHTML,
  );

  const modules = parse(tableHTML);

  if (writeTmpFile) fs.writeFileSync(tmpFile, JSON.stringify(modules, null, 2));

  await delay(1000);

  await browser.close();

  return modules;
};

export default getIsAcademiaNotes;
