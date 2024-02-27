import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{

    try {
       const connectionInstance= await mongoose.connect("mongodb+srv://sachinandan2121:Nandan1234@cluster0.0gdy8v6.mongodb.net");

       console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.Connection.host}`);
        
    } catch (error) {

        console.log("MONGODB connection Failed",error);
        process.exit(1)
        
    }

}

export default connectDB;