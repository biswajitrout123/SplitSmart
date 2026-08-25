import api from "./api";

export const getUserNotifications = async (page = 1, limit = 20) => {
    const response = await api.get(`/notifications`, {
        params: { page, limit }
    });
    return response.data;
};

export const markAsRead = async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.patch(`/notifications/read-all`);
    return response.data;
};

export const sendDebtReminder = async (groupId, debtorId) => {
    const response = await api.post(`/groups/${groupId}/remind`, { debtorId });
    return response.data;
};
