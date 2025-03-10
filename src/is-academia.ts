import puppeteer, { ElementHandle } from "puppeteer";
import { randomInt } from "node:crypto";
import { TOTP } from "totp-generator";
import { env } from "./env";
import { Module, parse } from "./modules";
import fs from "fs";
import { logger } from "./logger";

function delay(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

// Function to simulate human-like delay
function humanDelay(): Promise<void> {
    const time = randomInt(1, 3) * 1000;
    return delay(time);
}

const getIsAcademiaNotes = async (tmpFile: string, writeTmpFile = true): Promise<Module[]> => {
    /*
     * Launching Puppeteer browser
     */
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = (await browser.pages())[0];

    logger.info("Navigating to IsAcademia login page.");
    await page.goto("https://age.hes-so.ch/");

    await humanDelay();

    /*
     * Selecting the school identity provider
     */
    const selectorUserIdp = "#user_idp";
    await page.waitForSelector(selectorUserIdp);
    await page.select(selectorUserIdp, "https://aai-logon.hes-so.ch/idp/shibboleth");

    await humanDelay();

    /*
     * Submitting the identity provider form
     */
    const selectorIdentityButton = "#wayf_submit_button";
    await page.waitForSelector(selectorIdentityButton);
    await page.click(selectorIdentityButton);

    await humanDelay();

    /*
     * Typing username of Switch-Edu-ID
     */
    const selectorUsername = "#username";
    await page.waitForSelector(selectorUsername);
    await page.type(selectorUsername, env.SWITCH_USERNAME);

    await humanDelay();

    /*
     * Clicking the login button after entering username to show up password field
     */
    const selectorLoginButton = "#button-submit";
    await page.waitForSelector(selectorLoginButton);
    await page.click(selectorLoginButton);

    await humanDelay();

    /*
     * Handling the passkey proposition
     */
    if ((await page.$("#passkey-button")) !== null) {
        logger.info("Passkey proposed, choose password.");
        const selectorPassword = `a[name="to-password"]`;
        await page.waitForSelector(selectorPassword);
        await page.click(selectorPassword);

        await humanDelay();
    }

    /*
     * Typing the password of Switch-Edu-ID
     */
    const selectorPassword = "#password";
    await page.waitForSelector(selectorPassword);
    await page.type(selectorPassword, env.SWITCH_PASSWORD);

    await humanDelay();

    /*
     * Clicking the login button after entering password
     */
    const selectorConnection = "#button-proceed";
    await page.waitForSelector(selectorConnection);
    await page.click(selectorConnection);

    await humanDelay();

    /*
     * Handling the OTP if required
     */
    if ((await page.$("#otp")) !== null) {
        logger.info("OTP required, generating and submitting.");
        const selectorOTP = "#otp";
        await page.waitForSelector(selectorOTP);
        const otp = TOTP.generate(env.SWITCH_TOTP_SECRET);

        await page.type("#otp", otp.otp);

        await delay(1000);

        await page.waitForSelector(selectorLoginButton);
        await page.click(selectorLoginButton);

        await humanDelay();
    }

    /*
     * Navigate to "Portail étudiant HES" after login
     */
    await page.waitForFunction(() => document.readyState === "complete");
    await humanDelay();

    await page.goto("https://age.hes-so.ch/imoniteur_AGEP/!portal4s.htm");

    /*
     * Navigation to "Notes des contrôles continus"
     */
    await page.waitForFunction(() => document.readyState === "complete");
    await humanDelay();

    await page.evaluate(() => {
        const element = document.getElementById("410");
        if (element) {
            element.click();
        } else {
            throw new Error("Unable to find 'Notes des contrôles continus'");
        }
    });

    await humanDelay();

    /*
     * Selecting the specific semester
     */
    const selectorSpecificSemester = `//a[contains(text(), '${env.IS_ACADEMIA_SEMESTER}')]`;
    await page.waitForSelector(`::-p-xpath(${selectorSpecificSemester})`);
    const button1 = page.locator(`::-p-xpath(${selectorSpecificSemester})`) as unknown as ElementHandle;

    if (button1) {
        await button1.click();
    } else {
        throw new Error("Unable to find Semester button.");
    }

    await humanDelay();

    /*
     * Extracting the table of notes
     */
    logger.info("Extracting notes table.");
    const selectorTableNotes = "table[class=cc-inscr-matieres]";
    await page.waitForSelector(selectorTableNotes);
    const tableHTML = await page.$eval(selectorTableNotes, (element) => element.outerHTML);

    /*
     * Parsing the table to module objects
     */
    const modules = parse(tableHTML);

    // Optionally writing the modules to a temporary file for git archive
    if (writeTmpFile) {
        logger.info(`Writing modules to temporary file: ${tmpFile}`);
        fs.writeFileSync(tmpFile, JSON.stringify(modules, null, 2));
    }

    await delay(1000);

    /*
     * Closing the browser
     */
    await browser.close();
    logger.info("Browser closed. Retrieval process completed.");

    return modules;
};

export default getIsAcademiaNotes;
