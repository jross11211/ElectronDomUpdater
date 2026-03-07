import fs from "fs";
import {
    LIVE_CODESPACE_ARCHIVE_PATH,
    LIVE_CODESPACE_RUN_PATH,
    LIVE_CODESPACE_SOLUTION_PATH,
    LIVE_CODESPACE_TESTS_OUTPUT_PATH
} from "../config/constants.ts";
import logger from "../utils/logger.ts";

const trimContentForLog = (content: string) => {
    const maxChars = 25;
    return '\n' + content.substring(0, maxChars);
}

/* -------- `_live_code/solutions.py` -------- */
export const watchSolutionsFile = (listener: (content: string) => void) => {
    logger.trace('io', `Watching: ${LIVE_CODESPACE_SOLUTION_PATH}`);
    return fs.watch(LIVE_CODESPACE_SOLUTION_PATH, () => {
        listener(readLocalFile(LIVE_CODESPACE_SOLUTION_PATH));
    });
}
export const writeSolutionsFile = (content: string) => {
    logger.trace('io', 'Writing solutions.py', trimContentForLog(content));
    writeLocalFile(LIVE_CODESPACE_SOLUTION_PATH, content);
}

/* -------- `_live_code/tests_output.txt` -------- */
export const writeTestsFile = (content: string) => {
    logger.trace('io', 'Writing tests_output.txt', trimContentForLog(content));
    writeLocalFile(LIVE_CODESPACE_TESTS_OUTPUT_PATH, content);
}

/* -------- `_archive` -------- */
export const makeArchiveDir = () => {
    fs.mkdirSync(LIVE_CODESPACE_ARCHIVE_PATH, { recursive: true });
}

/* -------- `_archive/{id}_solution.py` -------- */
export const writeArchiveFile = (archiveFile: string, content: string) => {
    writeLocalFile(archiveFile, content);
}

/* -------- `_live_code/run.txt` -------- */
export const checkIfRunTxtExists = () => {
    if (fs.existsSync(LIVE_CODESPACE_RUN_PATH)) {
        logger.trace('io', `detected - run.txt! Asking front-end to run the code ...`);
        fs.unlinkSync(LIVE_CODESPACE_RUN_PATH);
        return true;
    }
    return false;
}

const readLocalFile = (fileName: string) => {
    return fs.readFileSync(fileName, 'utf8')
}

const writeLocalFile = (fileName: string, content: string) => {
    fs.writeFile(fileName, content, { encoding: 'utf-8' }, err => logger.error('io', err));
}
