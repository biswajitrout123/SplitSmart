import Group from "../models/group.model.js";

export const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;

        // 1. Validate group name
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide a group name"
            });
        }

        // 2. Create group
        const group = await Group.create({
            name,
            description,
            createdBy: req.user._id,
            members: [req.user._id]
        });
        // 3. Return success
        return res.status(201).json({
            success: true,
            message: "Group created successfully",
            group
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const getMyGroups = async (req, res) => {
    try {

        const groups = await Group.find({
            members: req.user._id
        }).sort({ createdAt: -1 });

        // 2. Return groups
        return res.status(200).json({
            success: true,
            count: groups.length,
            groups
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};