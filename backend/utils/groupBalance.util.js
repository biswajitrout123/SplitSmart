const roundMoney = (value) => {
    return Number(Number(value).toFixed(2));
};

export const calculateGroupBalances = ({
    members,
    expenses,
    settlements = []
}) => {
    if (!Array.isArray(members) || members.length === 0) {
        throw new Error("Group must have at least one member");
    }

    const memberCount = members.length;

    // --------------------------------------------------
    // TOTAL EXPENSE
    // --------------------------------------------------

    const totalExpense = expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount || 0),
        0
    );

    // --------------------------------------------------
    // INITIAL SHARE MAP
    // --------------------------------------------------

    const shareMap = new Map();

    members.forEach((member) => {
        shareMap.set(
            member._id.toString(),
            0
        );
    });

    // --------------------------------------------------
    // CALCULATE ACTUAL SHARES
    // --------------------------------------------------

    expenses.forEach((expense) => {

        // New expenses with split information
        if (
            Array.isArray(expense.splits) &&
            expense.splits.length > 0
        ) {

            expense.splits.forEach((split) => {
                const userId =
                    split.user.toString();

                if (!shareMap.has(userId)) {
                    return;
                }

                shareMap.set(
                    userId,
                    shareMap.get(userId) +
                    Number(split.amount || 0)
                );
            });

            return;
        }

        // --------------------------------------------------
        // OLD EXPENSES
        // --------------------------------------------------

        const equalShare =
            Number(expense.amount) /
            memberCount;

        members.forEach((member) => {
            const userId =
                member._id.toString();

            shareMap.set(
                userId,
                shareMap.get(userId) +
                equalShare
            );
        });
    });

    // --------------------------------------------------
    // BUILD BALANCES
    // --------------------------------------------------

    const balances = members.map((member) => {

        const userId =
            member._id.toString();

        // Total paid
        const paid = expenses
            .filter(
                (expense) => {
                    const paidById = expense.paidBy._id
                        ? expense.paidBy._id.toString()
                        : expense.paidBy.toString();
                    return paidById === userId;
                }
            )
            .reduce(
                (total, expense) =>
                    total +
                    Number(expense.amount || 0),
                0
            );

        // Actual share
        const share =
            shareMap.get(userId) || 0;

        // Balance before settlements
        let balance =
            paid - share;

        // --------------------------------------------------
        // APPLY SETTLEMENTS
        // --------------------------------------------------

        settlements.forEach((settlement) => {

            const fromId = settlement.from._id 
                ? settlement.from._id.toString() 
                : settlement.from.toString();

            const toId = settlement.to._id
                ? settlement.to._id.toString()
                : settlement.to.toString();

            const amount =
                Number(settlement.amount || 0);

            // This member paid someone
            if (fromId === userId) {
                balance += amount;
            }

            // This member received money
            if (toId === userId) {
                balance -= amount;
            }
        });

        return {
            userId: member._id,
            name: member.name,
            email: member.email,

            paid: roundMoney(paid),

            share: roundMoney(share),

            balance: roundMoney(balance)
        };
    });

    return {
        totalExpense: roundMoney(totalExpense),
        memberCount,
        balances
    };
};