import mongoose from "mongoose"

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://mrajay2910:arunkumar2910@cluster.wt3kc.mongodb.net/Reserve').then(() => console.log("DB Connected"));
}