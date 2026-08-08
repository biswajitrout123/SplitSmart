import jwt from 'jsonwebtoken'
import User from "../models/user.model.js"

export const authMiddleware = async (req, res, next) => {
    try {

        const token = req.cookies.token;
        // 1. Check token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 3. Find user
        const user = await User.findById(decoded.id);

        // 4. Check user
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        // 5. Attach user to request
        req.user = user;
        // 6. Continue to next middleware/controller
        next();

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                avatar: req.user.avatar
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};