import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

// Vite plugin to generate manifest.json for Chrome Extension (MV3)
function webExtensionPlugin() {
  const manifest = {
    manifest_version: 3,
    name: pkg.display,
    version: pkg.version,
    description: pkg.description,
    default_locale: 'en',
    icons: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
    action: {
      default_popup: 'popup/index.html',
      default_title: 'NOVA',
      default_icon: {
        '16': 'icons/icon-16.png',
        '32': 'icons/icon-32.png',
      },
    },
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
    chrome_url_overrides: {
      newtab: 'newtab/index.html',
    },
    options_page: 'options/index.html',
    background: {
      service_worker: 'background/background.js',
      type: 'module',
    },
    commands: {
      'command-palette': {
        suggested_key: {
          default: 'Ctrl+K',
          mac: 'Command+K',
        },
        description: 'Open Command Palette',
      },
      'search-tabs': {
        suggested_key: {
          default: 'Ctrl+Shift+P',
          mac: 'Command+Shift+P',
        },
        description: 'Search open tabs',
      },
      'save-page': {
        suggested_key: {
          default: 'Ctrl+Shift+S',
          mac: 'Command+Shift+S',
        },
        description: 'Save current page',
      },
      'open-side-panel': {
        suggested_key: {
          default: 'Ctrl+Shift+L',
          mac: 'Command+Shift+L',
        },
        description: 'Toggle side panel',
      },
    },
    permissions: [
      'storage',
      'tabs',
      'bookmarks',
      'history',
      'sidePanel',
      'scripting',
      'contextMenus',
    ],
    host_permissions: ['<all_urls>'],
  };

  return {
    name: 'web-extension',
    config() {
      return {
        base: './',
        build: {
          rollupOptions: {
            input: {
              newtab: resolve(__dirname, 'src/newtab/index.html'),
              sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
              popup: resolve(__dirname, 'src/popup/index.html'),
              options: resolve(__dirname, 'src/options/index.html'),
              background: resolve(__dirname, 'src/background/index.ts'),
            },
            output: {
              entryFileNames: chunk => {
                if (chunk.name === 'background') return 'background/[name].js';
                return '[name]/index.js';
              },
              chunkFileNames: chunk => {
                if (chunk.name === 'background') return 'background/[name].js';
                return '[name]/index.js';
              },
              assetFileNames: assetInfo => {
                if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                  return '[name][extname]';
                }
                if (assetInfo.name && assetInfo.name.endsWith('.html')) {
                  return assetInfo.name.replace(/^src\//, '');
                }
                return '[name][extname]';
              },
            },
          },
          outDir: 'dist',
          emptyOutDir: true,
        },
      };
    },
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');

      // Write manifest.json
      const manifestPath = resolve(distDir, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

      // Flatten HTML files: dist/src/newtab/index.html -> dist/newtab/index.html
      const srcDistDir = resolve(distDir, 'src');
      if (fs.existsSync(srcDistDir)) {
        const entries = fs.readdirSync(srcDistDir);
        for (const entry of entries) {
          const srcHtmlDir = resolve(srcDistDir, entry);
          if (fs.statSync(srcHtmlDir).isDirectory()) {
            const destDir = resolve(distDir, entry);
            fs.mkdirSync(destDir, { recursive: true });
            const files = fs.readdirSync(srcHtmlDir);
            for (const file of files) {
              fs.copyFileSync(resolve(srcHtmlDir, file), resolve(destDir, file));
            }
          }
        }
        fs.rmSync(srcDistDir, { recursive: true, force: true });
      }

      // Copy icons
      const iconsDir = resolve(__dirname, 'icons');
      const distIconsDir = resolve(distDir, 'icons');
      if (fs.existsSync(iconsDir)) {
        fs.mkdirSync(distIconsDir, { recursive: true });
        const files = fs.readdirSync(iconsDir);
        for (const file of files) {
          if (file.endsWith('.png')) {
            fs.copyFileSync(resolve(iconsDir, file), resolve(distIconsDir, file));
          }
        }
      }

      // Copy _locales
      const localesDir = resolve(__dirname, '_locales');
      const distLocalesDir = resolve(distDir, '_locales');
      if (fs.existsSync(localesDir)) {
        fs.mkdirSync(distLocalesDir, { recursive: true });
        const locales = fs.readdirSync(localesDir);
        for (const locale of locales) {
          const localePath = resolve(localesDir, locale);
          if (fs.statSync(localePath).isDirectory()) {
            fs.mkdirSync(resolve(distLocalesDir, locale), { recursive: true });
            const localeFiles = fs.readdirSync(localePath);
            for (const file of localeFiles) {
              if (file.endsWith('.json')) {
                fs.copyFileSync(resolve(localePath, file), resolve(distLocalesDir, locale, file));
              }
            }
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), webExtensionPlugin()],
  server: {
    port: 3000,
    open: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/commands': resolve(__dirname, 'src/commands'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
    },
  },
});
