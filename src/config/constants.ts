import dotenv from 'dotenv';
import process from "node:process";
dotenv.config({ quiet: true });

const getLiveCodeSpacePath = (relative_path: string) =>
{ return [ process.env.LIVE_CODESPACE_PATH, relative_path].join('/'); }

export const LIVE_CODESPACE_ARCHIVE_PATH = process.env.LIVE_CODESPACE_ARCHIVE_PATH;
export const LIVE_CODESPACE_SOLUTION_PATH = getLiveCodeSpacePath(process.env.LIVE_CODESPACE_SOLUTION_FILE);
export const LIVE_CODESPACE_TESTS_OUTPUT_PATH = getLiveCodeSpacePath(process.env.LIVE_CODESPACE_TESTS_OUTPUT_FILE);
export const LIVE_CODESPACE_RUN_PATH = getLiveCodeSpacePath(process.env.LIVE_CODESPACE_RUN_FILE);

export const URL_TARGET = process.env.URL_TARGET;

export const IPC_EVENTS = {
    APP_FULLY_LOADED: 'app-fully-loaded',
    EDITED_SOLUTION: 'edited-solution',
    TEST_RESULTS_ARRIVED: 'test-results-arrived',
};
