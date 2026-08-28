import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { createUserAndLogin } from './testHelpers.js';

setupTestDB();

describe('Validation API Tests', () => {
    let u1, u2, groupId;

    beforeEach(async () => {
        u1 = await createUserAndLogin({ name: 'V1', email: 'v1@example.com', password: 'password123' });
        u2 = await createUserAndLogin({ name: 'V2', email: 'v2@example.com', password: 'password123' });

        const groupRes = await request(app)
            .post('/api/groups')
            .set('Cookie', u1.cookie)
            .send({ name: 'Validation Group', description: 'Test' });
        
        groupId = groupRes.body.group._id;

        await request(app)
            .post(`/api/groups/${groupId}/members`)
            .set('Cookie', u1.cookie)
            .send({ userId: u2.user._id });
    });

    describe('Auth Validation', () => {
        it('should fail registration with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test'
                    // missing email and password
                });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });

        it('should fail login with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });
    });

    describe('Group Validation', () => {
        it('should fail group creation without name', async () => {
            const res = await request(app)
                .post('/api/groups')
                .set('Cookie', u1.cookie)
                .send({ description: 'No name' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });

        it('should fail adding member without email or userId', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/members`)
                .set('Cookie', u1.cookie)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });
    });

    describe('Expense Validation', () => {
        it('should fail creating expense with negative amount', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Negative',
                    amount: -50,
                    splitType: 'equal',
                    splits: [{ user: u1.user._id, amount: -50 }]
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });

        it('should fail creating expense with invalid split type', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Bad split',
                    amount: 50,
                    splitType: 'wrong-type',
                    splits: [{ user: u1.user._id, amount: 50 }]
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });

        it('should fail creating exact split with amounts not matching total', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Math mismatch',
                    amount: 100,
                    splitType: 'exact',
                    splits: [{ user: u1.user._id, amount: 50 }, { user: u2.user._id, amount: 40 }]
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
            expect(res.body.message).toMatch(/Exact split amounts must add up/);
        });

        it('should fail creating percentage split with percentages not matching 100', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Math mismatch',
                    amount: 100,
                    splitType: 'percentage',
                    splits: [{ user: u1.user._id, percentage: 50 }, { user: u2.user._id, percentage: 40 }]
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
            expect(res.body.message).toMatch(/Percentages must add up to 100%/);
        });
    });

    describe('Settlement Validation', () => {
        it('should fail creating settlement with missing recipient', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/settlements`)
                .set('Cookie', u1.cookie)
                .send({ amount: 50 });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Invalid input data:/);
        });
    });
});
