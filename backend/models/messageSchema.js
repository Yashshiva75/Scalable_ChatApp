import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    recieverId : {
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
    },
    message:{
        type:String,
        required:true
    }
},{timestamps:true})

export const message = mongoose.model("message",messageSchema)