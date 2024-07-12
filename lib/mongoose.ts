import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URI) 
        return "MONGODB_URI is not defined";

    if(isConnected)
        return "Using existing Database Connection";

    try {
        
        await mongoose.connect(process.env.MONGODB_URI);

        isConnected = true;

        console.log("Database is connected successfully !");

    } catch (error : any) {
        throw new Error(`Database connection failed. Error : ${error.message}`);
        
    }
}