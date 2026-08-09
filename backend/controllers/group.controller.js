import Group from "../models/group.model.js";
import User from "../models/user.model.js"

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



export const addMember = async (req, res) => {
    try{
        const {groupId} = req.params;
        const {userId} = req.body;

        // 1. Validate user ID
        if(!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a user ID"
            });
        }
        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 3. Check if requester is the group creator
        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the group creator can add members"
            });
        }

        // 4. Find user to add
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 5. Check if user is already a member
        const alreadyMember = group.members.some(
            (memberId) => memberId.toString() === userId.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this group"
            });
        }

        // 6. Add user to group
        group.members.push(userId);

        // 7. Save group
        await group.save();

        // 8. Return success
        return res.status(200).json({
            success: true,
            message: "Member added successfully",
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