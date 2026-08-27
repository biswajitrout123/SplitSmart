import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

setupTestDB();

describe('Auth API', () => {
    
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('name', 'Test User');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should fail with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User 2',
                    email: 'test2@example.com',
                    password: '123'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/password must be at least 6/i);
        });

        it('should fail with duplicate email', async () => {
            await request(app).post('/api/auth/register').send({
                name: 'User 1',
                email: 'dup@example.com',
                password: 'password123'
            });

            const res = await request(app).post('/api/auth/register').send({
                name: 'User 2',
                email: 'dup@example.com',
                password: 'password123'
            });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/email is already registered/i);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login an existing user', async () => {
            await request(app).post('/api/auth/register').send({
                name: 'Login User',
                email: 'login@example.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
            
            const cookies = res.headers['set-cookie'][0];
            expect(cookies).toMatch(/token=/);
            expect(cookies).toMatch(/HttpOnly/);
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('Protected routes', () => {
        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should allow authenticated requests', async () => {
            await request(app).post('/api/auth/register').send({
                name: 'Me User',
                email: 'me@example.com',
                password: 'password123'
            });

            const loginRes = await request(app).post('/api/auth/login').send({
                email: 'me@example.com',
                password: 'password123'
            });

            const cookie = loginRes.headers['set-cookie'];

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', cookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe('me@example.com');
        });
    });
});
