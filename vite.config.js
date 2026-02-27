import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const openAiApiKey = env.OPENAI_API_KEY || ''

  return {
    plugins: [react()],
    base: './',
    server: {
      proxy: {
        '/api/receipt-ocr': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/v1/responses',
          headers: openAiApiKey
            ? { Authorization: `Bearer ${openAiApiKey}` }
            : undefined
        }
      }
    }
  }
})
