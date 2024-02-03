import { env } from "./env";
import puppeteer from "puppeteer";

const getIsAcademiaNotes = async (): Promise<void> => {
  const browser = await puppeteer.launch();
  const page = (await browser.pages())[0];

  await page.goto("https://age.hes-so.ch/");

  await page.select("#user_idp", "https://aai-logon.hes-so.ch/idp/shibboleth");

  await page.click("#wayf_submit_button");

  await page.type("#username", env.USERNAME);

  await page.click("#login-button");

  await page.type("#password", env.PASSWORD);

  await page.click("#login-button");

  await page.click("#410");
  const button = (
    await page.$x(
      "//a[contains(text(), 'Informatique et systèmes de communication, Plein temps, 2023-2024, S1')]",
    )
  )[0];

  if (button) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await button.click();
  }

  // Todo get notes

  await browser.close();
};

export default getIsAcademiaNotes;
