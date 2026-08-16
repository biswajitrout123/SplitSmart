import api from "./api";

// CREATE EXPENSE
export const createExpense = async (groupId, expenseData) => {
    const response = await api.post(
        `/groups/${groupId}/expenses`,
        expenseData
    );

    return response.data;
};

// GET GROUP EXPENSES
export const getGroupExpenses = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/expenses`
    );

    return response.data;
};

// GET EXPENSE BY ID
export const getExpenseById = async (groupId, expenseId) => {
    const response = await api.get(
        `/groups/${groupId}/expenses/${expenseId}`
    );

    return response.data;
};

// UPDATE EXPENSE
export const updateExpense = async (
    groupId,
    expenseId,
    expenseData
) => {
    const response = await api.patch(
        `/groups/${groupId}/expenses/${expenseId}`,
        expenseData
    );

    return response.data;
};

// DELETE EXPENSE
export const deleteExpense = async (
    groupId,
    expenseId
) => {
    const response = await api.delete(
        `/groups/${groupId}/expenses/${expenseId}`
    );

    return response.data;
};

// EXPENSE ANALYTICS
export const getExpenseAnalytics = async (
    groupId,
    params = {}
) => {
    const response = await api.get(
        `/groups/${groupId}/expenses/analytics`,
        {
            params
        }
    );

    return response.data;
};

// MONTHLY EXPENSE TRENDS
export const getMonthlyExpenseTrends = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/expenses/monthly-trends`
    );

    return response.data;
};