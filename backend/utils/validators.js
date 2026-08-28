import { body, param, query } from "express-validator";

export const registerValidator = [
    body("name").trim().notEmpty().withMessage("Please provide all required fields"),
    body("email").trim().isEmail().withMessage("Please provide all required fields").custom(value => {
        if (!value) throw new Error("Please provide all required fields");
        return true;
    }),
    body("password").notEmpty().withMessage("Please provide all required fields").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

export const loginValidator = [
    body("email").trim().isEmail().withMessage("Please provide both email and password"),
    body("password").notEmpty().withMessage("Please provide both email and password")
];

export const createGroupValidator = [
    body("name").trim().notEmpty().withMessage("Please provide a group name")
];

export const addMemberValidator = [
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.userId) {
            throw new Error("Please provide a user email or user ID");
        }
        return true;
    }),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email format"),
    body("userId").optional({ checkFalsy: true }).isMongoId().withMessage("Invalid user ID format")
];

const sharedSplitValidators = [
    body("splits.*.user").optional().isMongoId().withMessage("Each split must have a valid user ID"),
    body("splits.*.amount").if(body('splitType').equals('exact')).isFloat({ min: 0 }).withMessage("Split amount must be a valid non-negative number").toFloat(),
    body("splits.*.percentage").if(body('splitType').equals('percentage')).isFloat({ min: 0, max: 100 }).withMessage("Percentage must be between 0 and 100").toFloat(),
    body().custom((value, { req }) => {
        const { splitType, splits, amount } = req.body;
        
        if (splitType === 'exact' && Array.isArray(splits) && amount !== undefined) {
            const splitTotal = splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
            if (Math.abs(splitTotal - Number(amount)) > 0.01) {
                throw new Error(`Exact split amounts must add up to ₹${Number(amount).toFixed(2)}`);
            }
        }
        
        if (splitType === 'percentage' && Array.isArray(splits)) {
            const percentageTotal = splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0);
            if (Math.abs(percentageTotal - 100) > 0.01) {
                throw new Error("Percentages must add up to 100%");
            }
        }
        
        return true;
    })
];

export const createExpenseValidator = [
    body("description").trim().notEmpty().withMessage("Please provide expense description"),
    body("amount").isFloat({ gt: 0 }).withMessage("Expense amount must be greater than 0").toFloat(),
    body("category").optional().isString(),
    body("customCategory").if(body('category').equals('Custom')).trim().notEmpty().withMessage("Please provide a custom category name"),
    body("splitType").isIn(["equal", "exact", "percentage"]).withMessage("Invalid split type"),
    body("splits").isArray().withMessage("Splits must be an array"),
    ...sharedSplitValidators
];

export const updateExpenseValidator = [
    body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be greater than 0").toFloat(),
    body("customCategory").if(body('category').equals('Custom')).trim().notEmpty().withMessage("Please provide a custom category name"),
    body("splitType").optional().isIn(["equal", "exact", "percentage"]).withMessage("Invalid split type"),
    body("splits").optional().isArray().withMessage("Splits must be an array"),
    ...sharedSplitValidators
];

export const createSettlementValidator = [
    body("to").isMongoId().withMessage("Recipient and amount are required"),
    body("amount").notEmpty().withMessage("Recipient and amount are required").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0").toFloat()
];

export const sendDebtReminderValidator = [
    body("debtorId").notEmpty().withMessage("Debtor ID is required").isMongoId().withMessage("Invalid debtor ID")
];
