import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Server is connected to DB");
    }
    catch(err) {
        console.log("DB connect fail");
        console.error(err.message);
        process.exit(1);
    }
}

export default connectDB;