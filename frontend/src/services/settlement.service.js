import api from "./api";

export const createSettlement = async (
    groupId,
    settlementData
) => {
    const response = await api.post(
        `/groups/${groupId}/settlements`,
        settlementData
    );

    return response.data;
};

export const getGroupSettlements = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/settlements`
    );

    return response.data;
};

export const deleteSettlement = async (
    groupId,
    settlementId
) => {
    const response = await api.delete(
        `/groups/${groupId}/settlements/${settlementId}`
    );

    return response.data;
};

export const getSimplifiedSettlements = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/simplified-settlements`
    );

    return response.data;
};

export const getSettlementSummary = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/settlements/summary`
    );

    return response.data;
};