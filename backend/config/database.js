import mongoose, { mongo } from "mongoose"
import dotenv from "dotenv";
dotenv.config()
const URI = process.env.MONGO_URI

export const connectDb =async ()=>{
    await mongoose.connect(URI).then(()=>{
        console.log('Db connected')
    }).catch((error)=>{
        console.log('Error in connecting db',error)
    })
}