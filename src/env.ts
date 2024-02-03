import { EnvType, load } from "ts-dotenv";

export const schema = {
  NODE_ENV: String,
  DEBUG: String,
  USERNAME: String,
  PASSWORD: String,
};

export let env: EnvType<typeof schema>;

export const loadEnv = (): void => {
  env = load(schema);
};
