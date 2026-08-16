import api from "./api";

export const createGroup = async (groupData) => {
    const response = await api.post(
        "/groups",
        groupData
    );

    return response.data;
};

export const getMyGroups = async () => {
    const response = await api.get(
        "/groups"
    );

    return response.data;
};

export const getGroupById = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}`
    );

    return response.data;
};

export const addMember = async (groupId, email) => {
    const response = await api.post(
        `/groups/${groupId}/members`,
        {
            email
        }
    );

    return response.data;
};

export const getGroupDashboard = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/dashboard`
    );

    return response.data;
};