import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { createUserAndLogin } from './testHelpers.js';

setupTestDB();

describe('Settlement API', () => {
    let u1, u2, u3, groupId;

    beforeEach(async () => {
        u1 = await createUserAndLogin({ name: 'S1', email: 's1@example.com', password: 'password123' });
        u2 = await createUserAndLogin({ name: 'S2', email: 's2@example.com', password: 'password123' });
        u3 = await createUserAndLogin({ name: 'S3', email: 's3@example.com', password: 'password123' });

        const groupRes = await request(app)
            .post('/api/groups')
            .set('Cookie', u1.cookie)
            .send({ name: 'Settlement Group', description: 'Test' });
        
        groupId = groupRes.body.group._id;

        await request(app)
            .post(`/api/groups/${groupId}/members`)
            .set('Cookie', u1.cookie)
            .send({ userId: u2.user._id });

        // U1 pays 100 for U1(50) and U2(50)
        await request(app)
            .post(`/api/groups/${groupId}/expenses`)
            .set('Cookie', u1.cookie)
            .send({
                description: 'Dinner',
                amount: 100,
                splitType: 'equal',
                splits: [
                    { user: u1.user._id, amount: 50 },
                    { user: u2.user._id, amount: 50 }
                ]
            });
    });

    describe('POST /api/groups/:groupId/settlements', () => {
        it('should allow settling a valid debt', async () => {
            // U2 owes U1 50
            const res = await request(app)
                .post(`/api/groups/${groupId}/settlements`)
                .set('Cookie', u2.cookie)
                .send({
                    to: u1.user._id,
                    amount: 50
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.settlement.amount).toBe(50);
            expect(res.body.settlement.from).toBe(u2.user._id);
        });

        it('should block overpaying a debt', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/settlements`)
                .set('Cookie', u2.cookie)
                .send({
                    to: u1.user._id,
                    amount: 60 // U2 only owes 50
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/cannot exceed/i);
        });

        it('should block non-debtor from settling', async () => {
            // U1 owes nothing
            const res = await request(app)
                .post(`/api/groups/${groupId}/settlements`)
                .set('Cookie', u1.cookie)
                .send({
                    to: u2.user._id,
                    amount: 10
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/do not currently owe money/i);
        });
    });

    describe('DELETE /api/groups/:groupId/settlements/:id', () => {
        it('should block unrelated member from deleting a settlement', async () => {
            // Add U3 to group
            await request(app)
                .post(`/api/groups/${groupId}/members`)
                .set('Cookie', u1.cookie)
                .send({ userId: u3.user._id });

            // U2 pays U1 50
            const settleRes = await request(app)
                .post(`/api/groups/${groupId}/settlements`)
                .set('Cookie', u2.cookie)
                .send({ to: u1.user._id, amount: 50 });

            const settleId = settleRes.body.settlement._id;

            // U3 tries to delete it
            const delRes = await request(app)
                .delete(`/api/groups/${groupId}/settlements/${settleId}`)
                .set('Cookie', u3.cookie);

            expect(delRes.status).toBe(403);
            expect(delRes.body.success).toBe(false);
        });
    });

    describe('POST /api/groups/:groupId/remind', () => {
        it('should allow sender to remind a debtor', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/remind`)
                .set('Cookie', u1.cookie)
                .send({ debtorId: u2.user._id });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should block reminding if no debt exists', async () => {
            // U2 reminds U1 (U1 owes nothing)
            const res = await request(app)
                .post(`/api/groups/${groupId}/remind`)
                .set('Cookie', u2.cookie)
                .send({ debtorId: u1.user._id });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
