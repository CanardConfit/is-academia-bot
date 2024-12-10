import { EnvType, load } from "ts-dotenv";

export const schema = {
    NODE_ENV: String,
    DEBUG: String,
    SWITCH_USERNAME: String,
    SWITCH_PASSWORD: String,
    SWITCH_TOTP_SECRET: String,
    IS_ACADEMIA_SEMESTER: String,
    MODULES_FILE: String,
    CACHE_FOLDER: String,
    GIT_ENABLED: Boolean,
    GIT_REMOTE: String,
    GIT_USERNAME: String,
    GIT_PASSWORD: String,
    GIT_BRANCH: String,
    GIT_FILE: String,
    DISCORD_ENABLED: Boolean,
    DISCORD_ID: String,
    DISCORD_TOKEN: String,
    TELEGRAM_ENABLED: Boolean,
    TELEGRAM_TOKEN: String,
    TELEGRAM_CHAT_ID: String,
};

export let env: EnvType<typeof schema>;

export const loadEnv = (): void => {
    env = load(schema);
};
