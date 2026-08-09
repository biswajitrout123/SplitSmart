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




export const getGroupById = async (req, res) => {
    try {

        // 1. Get group ID from URL 
        const { groupId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        // 3. Check if group exists
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 4. Check if logged-in user is a member
        const isMember = group.members.some(
            (memberId) => memberId.toString() == req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }
        // 5. Return group
        return res.status(200).json({
            success: true,
            group
        });



    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};