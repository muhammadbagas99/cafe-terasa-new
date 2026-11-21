import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 'base' harus sama persis dengan nama repo GitHub
export default defineConfig({ base: '/Terasa/', plugins: [vue()] })
