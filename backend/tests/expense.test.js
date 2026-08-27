import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { createUserAndLogin } from './testHelpers.js';

setupTestDB();

describe('Expense API', () => {
    let u1, u2, u3, groupId;

    beforeEach(async () => {
        u1 = await createUserAndLogin({ name: 'E1', email: 'e1@example.com', password: 'password123' });
        u2 = await createUserAndLogin({ name: 'E2', email: 'e2@example.com', password: 'password123' });
        u3 = await createUserAndLogin({ name: 'E3', email: 'e3@example.com', password: 'password123' });

        const groupRes = await request(app)
            .post('/api/groups')
            .set('Cookie', u1.cookie)
            .send({ name: 'Expense Group', description: 'Test' });
        
        groupId = groupRes.body.group._id;

        // Add u2 to group
        await request(app)
            .post(`/api/groups/${groupId}/members`)
            .set('Cookie', u1.cookie)
            .send({ userId: u2.user._id });
    });

    describe('POST /api/groups/:groupId/expenses', () => {
        it('should add an equal split expense', async () => {
            const res = await request(app)
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

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.expense.amount).toBe(100);
            expect(res.body.expense.splits[0].amount).toBe(50);
        });

        it('should add an exact split expense', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Groceries',
                    amount: 80,
                    splitType: 'exact',
                    splits: [
                        { user: u1.user._id, amount: 20 },
                        { user: u2.user._id, amount: 60 }
                    ]
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should add a percentage split expense', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Hotel',
                    amount: 200,
                    splitType: 'percentage',
                    splits: [
                        { user: u1.user._id, percentage: 25 },
                        { user: u2.user._id, percentage: 75 }
                    ]
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            const splits = res.body.expense.splits;
            expect(splits.find(s => s.user._id.toString() === u1.user._id.toString()).amount).toBe(50);
            expect(splits.find(s => s.user._id.toString() === u2.user._id.toString()).amount).toBe(150);
        });

        it('should reject exact split if totals do not match', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'Error Exact',
                    amount: 100,
                    splitType: 'exact',
                    splits: [
                        { user: u1.user._id, amount: 50 },
                        { user: u2.user._id, amount: 40 } // Totals 90 != 100
                    ]
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/must add up to/i);
        });

        it('should block non-member from adding an expense', async () => {
            const res = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u3.cookie)
                .send({
                    description: 'Sneaky Expense',
                    amount: 100,
                    splitType: 'equal',
                    splits: [
                        { user: u3.user._id, amount: 100 }
                    ]
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/groups/:groupId/expenses/:expenseId', () => {
        it('should block non-creator from deleting an expense', async () => {
            const expenseRes = await request(app)
                .post(`/api/groups/${groupId}/expenses`)
                .set('Cookie', u1.cookie)
                .send({
                    description: 'U1 Paid',
                    amount: 100,
                    splitType: 'equal',
                    splits: [{ user: u1.user._id, amount: 100 }]
                });

            const expenseId = expenseRes.body.expense._id;

            const res = await request(app)
                .delete(`/api/groups/${groupId}/expenses/${expenseId}`)
                .set('Cookie', u2.cookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
});
