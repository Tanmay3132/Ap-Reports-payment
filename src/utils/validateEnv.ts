import { cleanEnv, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    MONGO_URI: str(),
    API_KEY: str(),
    LOG_GROUP_NAME: str(),
    LOG_SERVICE_NAME: str(),
    LOKI_URL: str()
  });
};

