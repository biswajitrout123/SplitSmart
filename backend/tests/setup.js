import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, afterAll, afterEach } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

export const setupTestDB = () => {
    beforeAll(async () => {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI must be defined in .env');
        }
        
        // Ensure we are connecting to a test database so we don't drop real data
        const uniqueId = Math.random().toString(36).substring(7);
        const testUri = uri.includes('?') 
            ? uri.replace('?', `-test-${uniqueId}?`) 
            : `${uri}-test-${uniqueId}`;
        
        await mongoose.connect(testUri);
    });

    afterAll(async () => {
        // Drop the test database and close connection
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
        }
        await mongoose.disconnect();
    });

    afterEach(async () => {
        // Clear all collections after each test to ensure isolation
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    });
};
