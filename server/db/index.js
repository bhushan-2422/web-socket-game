import mongoose from "mongoose";
import { db_name } from "../constant.js";

const connectDB = async () =>{
    
    try{
        const instance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log("MONGO DB succesfully connected");
    }catch(e){
        console.log("MONGO DB CONNECTION ERROR: ",e);
    }
}

export default connectDB;