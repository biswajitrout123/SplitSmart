import AppError from "./AppError.js";

const roundMoney = (value) => {
    return Number(Number(value).toFixed(2));
};

export const calculateExpenseSplits = ({
    amount,
    splitType = "equal",
    splits,
    memberIds
}) => {
    const totalAmount = Number(amount);

    if (!totalAmount || totalAmount <= 0) {
        throw new AppError(
            "Expense amount must be greater than 0",
            400
        );
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
        throw new AppError(
            "Group must have at least one member",
            400
        );
    }

    // ---------------------------------------------
    // EQUAL SPLIT
    // ---------------------------------------------
    if (splitType === "equal") {
        const baseAmount =
            Math.floor(
                (totalAmount / memberIds.length) * 100
            ) / 100;

        let distributed =
            baseAmount * memberIds.length;

        const remaining =
            roundMoney(totalAmount - distributed);

        const result = memberIds.map(
            (memberId, index) => ({
                user: memberId,
                amount:
                    index === memberIds.length - 1
                        ? roundMoney(
                            baseAmount + remaining
                        )
                        : roundMoney(baseAmount)
            })
        );

        return result;
    }

    // ---------------------------------------------
    // EXACT SPLIT
    // ---------------------------------------------
    if (splitType === "exact") {
        if (!Array.isArray(splits) || splits.length === 0) {
            throw new AppError(
                "Please provide exact split amounts",
                400
            );
        }

        const memberIdSet = new Set(
            memberIds.map((id) => id.toString())
        );

        const seenUsers = new Set();

        const result = splits.map((split) => {
            if (!split?.user) {
                throw new AppError(
                    "Each split must contain a user",
                    400
                );
            }

            const userId = split.user.toString();

            if (!memberIdSet.has(userId)) {
                throw new AppError(
                    "Split user is not a member of this group",
                    400
                );
            }

            if (seenUsers.has(userId)) {
                throw new AppError(
                    "A member cannot appear more than once in splits",
                    400
                );
            }

            seenUsers.add(userId);

            const splitAmount = Number(
                split.amount
            );

            if (
                Number.isNaN(splitAmount) ||
                splitAmount < 0
            ) {
                throw new AppError(
                    "Split amount must be a valid non-negative number",
                    400
                );
            }

            return {
                user: split.user,
                amount: roundMoney(splitAmount)
            };
        });

        const splitTotal = roundMoney(
            result.reduce(
                (sum, split) =>
                    sum + split.amount,
                0
            )
        );

        if (Math.abs(splitTotal - totalAmount) > 0.01) {
            throw new AppError(
                `Exact split amounts must add up to ₹${totalAmount.toFixed(2)}`,
                400
            );
        }

        return result;
    }

    // ---------------------------------------------
    // PERCENTAGE SPLIT
    // ---------------------------------------------
    if (splitType === "percentage") {
        if (!Array.isArray(splits) || splits.length === 0) {
            throw new AppError(
                "Please provide percentage splits",
                400
            );
        }

        const memberIdSet = new Set(
            memberIds.map((id) => id.toString())
        );

        const seenUsers = new Set();

        const percentageSplits = splits.map(
            (split) => {
                if (!split?.user) {
                    throw new AppError(
                        "Each split must contain a user",
                        400
                    );
                }

                const userId =
                    split.user.toString();

                if (!memberIdSet.has(userId)) {
                    throw new AppError(
                        "Split user is not a member of this group",
                        400
                    );
                }

                if (seenUsers.has(userId)) {
                    throw new AppError(
                        "A member cannot appear more than once in splits",
                        400
                    );
                }

                seenUsers.add(userId);

                const percentage =
                    Number(split.percentage);

                if (
                    Number.isNaN(percentage) ||
                    percentage < 0 ||
                    percentage > 100
                ) {
                    throw new AppError(
                        "Percentage must be between 0 and 100",
                        400
                    );
                }

                return {
                    user: split.user,
                    percentage
                };
            }
        );

        const percentageTotal =
            percentageSplits.reduce(
                (sum, split) =>
                    sum + split.percentage,
                0
            );

        if (
            Math.abs(percentageTotal - 100) >
            0.01
        ) {
            throw new AppError(
                "Percentages must add up to 100%",
                400
            );
        }

        const result =
            percentageSplits.map(
                (split) => ({
                    user: split.user,
                    amount: roundMoney(
                        totalAmount *
                        (split.percentage / 100)
                    )
                })
            );

        // Correct possible rounding difference.
        const calculatedTotal = roundMoney(
            result.reduce(
                (sum, split) =>
                    sum + split.amount,
                0
            )
        );

        const difference = roundMoney(
            totalAmount - calculatedTotal
        );

        if (difference !== 0) {
            result[result.length - 1].amount =
                roundMoney(
                    result[result.length - 1].amount +
                    difference
                );
        }

        return result;
    }

    throw new AppError(
        "Invalid split type",
        400
    );
};