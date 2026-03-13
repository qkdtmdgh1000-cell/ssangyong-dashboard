import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포 시 base를 저장소 이름으로 변경하세요
// 예: base: '/ssangyong-dashboard/'
export default defineConfig({
  plugins: [react()],
  base: '/ssangyong-dashboard/',
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/d3') || id.includes('node_modules/topojson')) {
            return 'd3-vendor';
          }
        },
      },
    },
  },
})
