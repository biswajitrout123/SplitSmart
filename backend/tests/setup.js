import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, afterAll, afterEach } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

let connectionCount = 0;

export const setupTestDB = () => {
    beforeAll(async () => {
        connectionCount++;
        if (mongoose.connection.readyState === 0) {
            const uri = process.env.MONGO_URI;
            if (!uri) throw new Error('MONGO_URI must be defined in .env');
            const uniqueId = Math.random().toString(36).substring(7);
            const testUri = uri.includes('?') ? uri.replace('?', '-test-' + uniqueId + '?') : uri + '-test-' + uniqueId;
            await mongoose.connect(testUri);
        }
    });

    afterAll(async () => {
        connectionCount--;
        if (connectionCount <= 0) {
            if (mongoose.connection.db) {
                await mongoose.connection.db.dropDatabase();
            }
            await mongoose.disconnect();
            connectionCount = 0;
        }
    });

    afterEach(async () => {
        if (mongoose.connection.readyState !== 0) {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                const collection = collections[key];
                await collection.deleteMany();
            }
        }
    });
};
