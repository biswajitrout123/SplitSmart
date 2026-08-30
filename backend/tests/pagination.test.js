import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { setupTestDB } from "./setup.js";
import { createUserAndLogin } from "./testHelpers.js";
import Group from "../models/group.model.js";
import Expense from "../models/expense.model.js";
import Notification from "../models/notification.model.js";

setupTestDB();

describe("Pagination & Optimization Tests", () => {
    let token;
    let user;
    let group;

    beforeEach(async () => {
        const u1 = await createUserAndLogin({ name: 'Page User', email: 'page@example.com', password: 'password123' });
        token = u1.cookie;
        user = u1.user;

        // Create a group
        const groupRes = await request(app)
            .post("/api/groups")
            .set("Cookie", token)
            .send({
                name: "Pagination Test Group",
                description: "Testing pagination boundaries"
            });
        
        group = await Group.findById(groupRes.body.group._id);

        // Seed 105 expenses
        const expensesToInsert = [];
        for (let i = 0; i < 105; i++) {
            expensesToInsert.push({
                description: `Expense ${i}`,
                amount: 10 + i,
                category: "Other",
                group: group._id,
                paidBy: user._id,
                splitType: "equal",
                splits: [{ user: user._id, amount: 10 + i }]
            });
        }
        await Expense.insertMany(expensesToInsert);

        // Seed 105 notifications
        const notificationsToInsert = [];
        for (let i = 0; i < 105; i++) {
            notificationsToInsert.push({
                user: user._id,
                group: group._id,
                type: "expense_added",
                message: `Notification ${i}`,
                isRead: false
            });
        }
        await Notification.insertMany(notificationsToInsert);
    });

    describe("Expenses Pagination", () => {
        it("should return default limit of 20", async () => {
            const res = await request(app)
                .get(`/api/groups/${group._id}/expenses`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.expenses.length).toBe(20);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(20);
            expect(res.body.total).toBe(105);
            expect(res.body.totalPages).toBe(6);
        });

        it("should enforce maximum limit of 100", async () => {
            const res = await request(app)
                .get(`/api/groups/${group._id}/expenses?limit=500`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.expenses.length).toBe(100);
            expect(res.body.limit).toBe(100);
            expect(res.body.totalPages).toBe(2);
        });

        it("should fetch page 2 correctly", async () => {
            const res = await request(app)
                .get(`/api/groups/${group._id}/expenses?limit=50&page=2`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.expenses.length).toBe(50);
            expect(res.body.page).toBe(2);
        });
        
        it("should fetch page 3 correctly (boundary)", async () => {
            const res = await request(app)
                .get(`/api/groups/${group._id}/expenses?limit=50&page=3`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.expenses.length).toBe(5);
            expect(res.body.page).toBe(3);
        });
    });

    describe("Notifications Pagination", () => {
        it("should return default limit of 20", async () => {
            const res = await request(app)
                .get(`/api/notifications`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.notifications.length).toBe(20);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(20);
            expect(res.body.total).toBe(105);
        });

        it("should enforce maximum limit of 100", async () => {
            const res = await request(app)
                .get(`/api/notifications?limit=500`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.notifications.length).toBe(100);
            expect(res.body.limit).toBe(100);
        });
    });
    
    describe("Activity Pagination", () => {
        it("should enforce maximum limit of 100", async () => {
            const res = await request(app)
                .get(`/api/groups/${group._id}/activities?limit=500`)
                .set("Cookie", token);

            expect(res.status).toBe(200);
            expect(res.body.activities.length).toBeLessThanOrEqual(100);
            expect(res.body.limit).toBe(100);
        });
    });
});
