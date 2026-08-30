import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Read backend .env to get the real MONGO_URI but change the DB name to avoid corruption
const envPath = path.resolve(__dirname, 'backend/.env');
let mongoUri = 'mongodb://127.0.0.1:27017/splitsmart_e2e_test';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^MONGO_URI=(.*)$/m);
  if (match) {
    mongoUri = match[1].trim().replace('/splitsmart?', '/splitsmart_e2e?');
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // We can add Firefox/WebKit later if needed. Keeping minimal for now.
  ],
  webServer: [
    {
      command: 'cd backend && npm start',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        MONGO_URI: mongoUri,
        NODE_ENV: 'test',
        JWT_SECRET: 'e2e_test_secret_key_123'
      }
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    }
  ],
});
