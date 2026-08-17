export const calculateEqualSplit = (amount, userIds) => {
    if (!userIds.length) {
        return [];
    }

    const total = Number(amount);
    const count = userIds.length;

    const baseAmount = Number(
        (total / count).toFixed(2)
    );

    let allocated = 0;

    return userIds.map((userId, index) => {
        let share;

        if (index === count - 1) {
            share = Number(
                (total - allocated).toFixed(2)
            );
        } else {
            share = baseAmount;
            allocated += share;
        }

        return {
            user: userId,
            amount: share,
            percentage: Number(
                ((share / total) * 100).toFixed(2)
            )
        };
    });
};


export const calculatePercentageSplit = (
    amount,
    splits
) => {
    const totalPercentage = splits.reduce(
        (sum, split) =>
            sum + Number(split.percentage),
        0
    );

    if (
        Math.abs(totalPercentage - 100) >
        0.01
    ) {
        return null;
    }

    const total = Number(amount);

    let allocated = 0;

    return splits.map((split, index) => {
        let calculatedAmount;

        if (index === splits.length - 1) {
            calculatedAmount = Number(
                (total - allocated).toFixed(2)
            );
        } else {
            calculatedAmount = Number(
                (
                    total *
                    (Number(split.percentage) / 100)
                ).toFixed(2)
            );

            allocated += calculatedAmount;
        }

        return {
            user: split.userId,
            amount: calculatedAmount,
            percentage: Number(
                Number(split.percentage).toFixed(2)
            )
        };
    });
};