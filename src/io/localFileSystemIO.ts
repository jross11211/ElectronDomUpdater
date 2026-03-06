import fs from "fs";
import {
    LIVE_CODESPACE_ARCHIVE_PATH,
    LIVE_CODESPACE_RUN_PATH,
    LIVE_CODESPACE_SOLUTION_PATH,
    LIVE_CODESPACE_TESTS_OUTPUT_PATH
} from "../config/constants.ts";

/* -------- `_live_code/solutions.py` -------- */
export const watchSolutionsFile = (listener: (content: string) => void) => {
    return fs.watch(LIVE_CODESPACE_SOLUTION_PATH, () => {
        listener(readLocalFile(LIVE_CODESPACE_SOLUTION_PATH));
    });
}
export const writeSolutionsFile = (content: string) => {
    writeLocalFile(LIVE_CODESPACE_SOLUTION_PATH, content);
}

/* -------- `_live_code/tests_output.txt` -------- */
export const writeTestsFile = (content: string) => {
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
        fs.unlinkSync(LIVE_CODESPACE_RUN_PATH);
        return true;
    }
    return false;
}

const readLocalFile = (fileName: string) => {
    return fs.readFileSync(fileName, 'utf8')
}

const writeLocalFile = (fileName: string, content: string) => {
    fs.writeFile(fileName, content, { encoding: 'utf-8' }, console.error);
}
