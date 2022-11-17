import { defineConfig } from 'vite';
import { AntdResolve, createStyleImportPlugin } from 'vite-plugin-style-import';
import lodash from 'lodash';
import path from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import dts from 'vite-plugin-dts';

const { upperFirst, camelCase } = lodash;

const cwd = process.cwd();
const isExample = process.env.VITE_ENV === 'example';

console.log('isExample', isExample);

const pkg = JSON.parse(fs.readFileSync(join('package.json')));
const pkgName = upperFirst(camelCase(pkg.name.replace(/^.*?([\w-]+)$/, '$1')));

function resolve(url) {
  return path.resolve(__dirname, url);
}

function join(url) {
  return path.join(cwd, url);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  envPrefix: 'APP_',
  server: {
    host: '0.0.0.0',
  },
  build: {
    outDir: isExample ? join('example') : join('lib'),
    lib: isExample
      ? undefined
      : {
          entry: join('src'),
          name: pkgName,
          formats: ['es', 'umd'],
          fileName: (format) => `index.${format}.js`,
        },
    rollupOptions: isExample
      ? {}
      : {
          external: ['react', 'react-dom', 'antd'],
          output: {
            globals: {
              react: 'react',
              antd: 'antd',
              'react-dom': 'react-dom',
            },
          },
        },
  },
  resolve: {
    alias: {
      '@': resolve('./demo'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react(),
    isExample &&
      legacy({
        polyfills: true,
      }),
    isExample &&
      createStyleImportPlugin({
        resolves: [AntdResolve()],
      }),
    dts({
      tsConfigFilePath: resolve('./tsconfig.json'),
    }),
  ],
});
