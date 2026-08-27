import request from 'supertest';
import app from '../app.js';

export const createTestUser = async (user) => {
    const res = await request(app).post('/api/auth/register').send(user);
    if (res.status !== 201) throw new Error(`Failed to create test user: ${res.text}`);
    return res.body.user;
};

export const getTestUserToken = async (email, password) => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    if (res.status !== 200) {
        console.error(`Login failed for ${email}:`, res.text);
        throw new Error(`Failed to login test user: ${res.text}`);
    }
    return res.headers['set-cookie'];
};

export const createUserAndLogin = async (user) => {
    const createdUser = await createTestUser(user);
    const cookie = await getTestUserToken(user.email, user.password);
    return { user: createdUser, cookie };
};
