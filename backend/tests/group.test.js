import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { createUserAndLogin } from './testHelpers.js';

setupTestDB();

describe('Group API', () => {
    
    describe('POST /api/groups', () => {
        it('should create a group successfully', async () => {
            const { cookie, user } = await createUserAndLogin({
                name: 'Group Creator',
                email: 'creator@example.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/groups')
                .set('Cookie', cookie)
                .send({
                    name: 'Test Group',
                    description: 'A group for testing'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.group.name).toBe('Test Group');
            expect(res.body.group.createdBy).toBe(user._id);
            expect(res.body.group.members).toContain(user._id);
        });

        it('should reject group creation without name', async () => {
            const { cookie } = await createUserAndLogin({
                name: 'Group Creator 2',
                email: 'creator2@example.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/groups')
                .set('Cookie', cookie)
                .send({
                    description: 'A group without name'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/groups/:groupId', () => {
        it('should fetch a group if user is a member', async () => {
            const { cookie } = await createUserAndLogin({
                name: 'G Member',
                email: 'gmember@example.com',
                password: 'password123'
            });

            const groupRes = await request(app)
                .post('/api/groups')
                .set('Cookie', cookie)
                .send({ name: 'Member Group', description: 'Test' });

            const groupId = groupRes.body.group._id;

            const res = await request(app)
                .get(`/api/groups/${groupId}`)
                .set('Cookie', cookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.group.name).toBe('Member Group');
        });

        it('should block access if user is not a member', async () => {
            const creator = await createUserAndLogin({
                name: 'Creator',
                email: 'gcreator@example.com',
                password: 'password123'
            });

            const nonMember = await createUserAndLogin({
                name: 'Non Member',
                email: 'nonmember@example.com',
                password: 'password123'
            });

            const groupRes = await request(app)
                .post('/api/groups')
                .set('Cookie', creator.cookie)
                .send({ name: 'Exclusive Group', description: 'Test' });

            const groupId = groupRes.body.group._id;

            const res = await request(app)
                .get(`/api/groups/${groupId}`)
                .set('Cookie', nonMember.cookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not a member/i);
        });

        it('should return safe 404 for malformed object id', async () => {
            const { cookie } = await createUserAndLogin({
                name: 'G Member 2',
                email: 'gmember2@example.com',
                password: 'password123'
            });

            const res = await request(app)
                .get('/api/groups/invalidObjectId')
                .set('Cookie', cookie);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
            expect(res.body.message).not.toMatch(/Cast to ObjectId/);
        });
    });

});
