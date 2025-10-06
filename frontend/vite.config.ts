import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  base: './', // 👈 ensures relative paths for GitHub Pages
  plugins: [react(), tailwind()],
});
  