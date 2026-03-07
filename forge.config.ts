// noinspection JSUnusedGlobalSymbols

import fs from 'fs';
import make_temp_file from 'tempfile';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';

// ------ Make the Vite config as a temp file ------
const viteConfigFile = make_temp_file({ extension: '.ts' });
fs.writeFile(viteConfigFile, "export default {};", () => {});

// ------ ForgeConfig ------
export default {
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/index.ts',
          config: viteConfigFile,
          target: 'main',
        },
        {
          entry: 'src/preload/index.ts',
          config: viteConfigFile,
          target: 'preload',
        }
      ],
      renderer: [],
    })
  ],
} as ForgeConfig;
