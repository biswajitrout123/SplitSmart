import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please Provide a name"],
            trim: true,
            maxLength: [50, "Name cannot exceeded 50 characters"]
        },
        email:{
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, "Please provide a valid email"]
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minLength: [6, "Password must be at least 6 characters"]
        },
        avatar: {
            type: String,
            default: null
        }
    }, {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

export default User;