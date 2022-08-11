pnpm create vite
pnpm i @vitejs/plugin-vue-jsx -D

vite.config.js 

import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()]
})


pnpm install element-plus