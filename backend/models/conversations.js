import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participantsId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }], 
    message:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"message"
    }]
},{timestamps:true})

export const conversations = mongoose.model("converation",conversationSchema)