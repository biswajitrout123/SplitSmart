import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

app.listen(3000,() => {
    console.log("Server is running on port 3000");
})