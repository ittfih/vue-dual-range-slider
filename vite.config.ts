import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/components/VueDualRangeSlider.vue',
      name: 'VueDualRangeSlider',
      fileName: 'vue-dual-range-slider'
    }
  }
})
