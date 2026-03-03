import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const URL_TARGET = process.env.URL_TARGET;

export const LIVE_CODESPACE_PATH = process.env.LIVE_CODESPACE_PATH;
export const LIVE_CODESPACE_SOLUTION_PATH = LIVE_CODESPACE_PATH + process.env.LIVE_CODESPACE_SOLUTION_FILE;
