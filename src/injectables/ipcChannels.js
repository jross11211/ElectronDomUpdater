export const getIpcChannelsWrapper = () => {
     const ipcChannels = {
         "IPC_APP_FULLY_LOADED": 'app-fully-loaded',
         "IPC_UPDATED_SOLUTION": 'updated-solution',
         "IPC_TESTS_UPDATED": 'tests-updated',
         "IPC_RUN_CODE": 'run-code'
     };
     if (typeof window !== 'undefined') {
         window.ipcChannels = ipcChannels;
     }
     return ipcChannels;
}

export default getIpcChannelsWrapper();
