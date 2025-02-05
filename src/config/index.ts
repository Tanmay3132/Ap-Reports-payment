import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, MONGO_URI, API_KEY, LOG_GROUP_NAME, LOG_SERVICE_NAME, LOKI_URL } = process.env;
export const { DB_HOST, DB_PORT, DB_DATABASE } = process.env;
