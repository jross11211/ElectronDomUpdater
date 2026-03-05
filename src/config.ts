import { app } from 'electron';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const URL_TARGET = process.env.URL_TARGET;

export const ROOT_PATH = app.getAppPath();

const getPath = (relative_path: string) => {
    return [ ROOT_PATH, relative_path].join('/')
}

export const LIVE_CODESPACE_ARCHIVE_PATH = getPath(process.env.ARCHIVE_FOLDER)
export const LIVE_CODESPACE_SOLUTION_PATH = getPath(process.env.LIVE_CODESPACE_SOLUTION_FILE);
export const LIVE_CODESPACE_TESTS_OUTPUT_PATH = getPath(process.env.LIVE_CODESPACE_TESTS_OUTPUT_FILE);
