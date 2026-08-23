import api from "./api";

/**
 * Fetch group activity feed
 * @param {string} groupId 
 * @param {number} page 
 * @param {number} limit 
 */
export const getGroupActivity = async (groupId, page = 1, limit = 50) => {
    const response = await api.get(`/groups/${groupId}/activities`, {
        params: { page, limit }
    });
    return response.data;
};
