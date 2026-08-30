import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate Data
        // Basic validation is handled by registerValidator middleware

        // 2. Check if Email Exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save User
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 5. Return Success
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    }
    catch (err) {
        next(err);
    }
}



export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Validate Data
        // Basic validation is handled by loginValidator middleware

        // 2. Find User (and select the password field, which might be hidden by default in some setups)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 3. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 4. Generate JWT
        // You MUST have a JWT_SECRET in your .env file!
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token lasts for 7 days
        );

        // 5. Setup Cookie Options
        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
            httpOnly: true, // Cannot be accessed by frontend JS (mitigates XSS)
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
        };

        // 6. Send Response with Cookie
        res.status(200).cookie('token', token, options).json({
            success: true,
            message: 'Logged in successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (err) {
        next(err);
    }
}



export const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out Successfully"
        });

    } catch (err) {
        next(err);
    }
}