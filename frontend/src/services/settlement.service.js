import api from "./api";

// CREATE SETTLEMENT
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

// GET GROUP SETTLEMENTS
export const getGroupSettlements = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/settlements`
    );

    return response.data;
};

// DELETE SETTLEMENT
export const deleteSettlement = async (
    groupId,
    settlementId
) => {
    const response = await api.delete(
        `/groups/${groupId}/settlements/${settlementId}`
    );

    return response.data;
};

// GET SIMPLIFIED SETTLEMENTS
export const getSimplifiedSettlements = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/simplified-settlements`
    );

    return response.data;
};

// GET SETTLEMENT SUMMARY
export const getSettlementSummary = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/settlements/summary`
    );

    return response.data;
};