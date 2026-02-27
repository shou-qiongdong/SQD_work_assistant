import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from 'unocss/vite';
import { resolve } from 'path';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  const buildTarget = env.VITE_BUILD_TARGET || 'tauri';
  const inputs: Record<string, string> = {
    main: resolve(__dirname, 'index.html'),
    stats: resolve(__dirname, 'stats.html'),
  };

  if (buildTarget !== 'web') {
    inputs.quickAdd = resolve(__dirname, 'quick-add.html');
  }

  return {
  plugins: [vue(), UnoCSS()],
  base,

  // 多页面应用配置
  build: {
    rollupOptions: {
      input: inputs,
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  };
});
