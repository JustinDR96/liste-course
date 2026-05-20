import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';
import fs from 'node:fs';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'ListeDeCourses',
    executableName: 'ListeDeCourses',
    icon: './assets/icon',
    // Copier le .wasm de sql.js dans le build
    extraResource: [
      path.resolve('./node_modules/sql.js/dist/sql-wasm.wasm'),
    ],
    // Windows uniquement
    platform: 'win32',
    arch: 'x64',
  },
  rebuildConfig: {},
  makers: [
    // ZIP portable — pas d'installeur, juste un dossier à extraire
    new MakerZIP({}, ['win32']),
  ],
  hooks: {
    // Après packaging, créer un script batch de lancement portable
    postPackage: async (_, options) => {
      const outputDir = options.outputPaths[0];
      const batContent = `@echo off\nstart "" "%~dp0ListeDeCourses.exe"\n`;
      fs.writeFileSync(path.join(outputDir, 'Lancer.bat'), batContent);
    },
  },
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false, // Désactivé pour sql.js wasm
      [FuseV1Options.OnlyLoadAppFromAsar]: false, // Désactivé pour sql.js wasm
    }),
  ],
};

export default config;
