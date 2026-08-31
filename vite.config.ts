import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repository as a project page. Keep Vite's root
  // base during local development so `npm run dev` continues to work normally.
  base: command === 'build' ? '/pose_board/' : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 43127,
    strictPort: true,
  },
}))
