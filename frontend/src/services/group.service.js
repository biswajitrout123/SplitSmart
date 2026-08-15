import api from "./api";

export const getMyGroups = async () => {
    const response = await api.get("/groups");

    return response.data;
};

export const getGroupDashboard = async (groupId) => {
    const response = await api.get(`/groups/${groupId}/dashboard`);

    return response.data;
};