import {conversations} from '../models/conversations.js'
import { message } from '../models/messageSchema.js';

import { connectRedis } from "../redisServer/redisServer.js";

const redis = connectRedis();

export const sendMessage = async(req,res)=>{
    try{
      const sendersId = req.user;
      const recieverId = req.params.id;
      const mesage = req.body.message;

      let gotConversation = await conversations.findOne({
          participantsId:{$all:[sendersId,recieverId]}
      })

      if(!gotConversation){
        gotConversation = await conversations.create({
          participantsId:[sendersId,recieverId]
        })
      }

      const NewMessage = await message.create({
        senderId:sendersId,
        recieverId:recieverId,
        message:mesage
      })

      if(NewMessage){
        gotConversation.message.push(NewMessage._id)
      }

      await gotConversation.save()
      return res.status(200).json({message:"Message sent Successfully"}) 

    }catch(error){
      console.log('Error in send message',error)
      return res.status(500).json('Error in api')
    }
}

export const getMessages = async(req,res)=>{
   try{
      const senderId = req.user;
      const recieverId = req.params.id;
      const cacheKey = `messages:${senderId}:${recieverId}`;

      const cachedMessages = await redis.get(cacheKey)

      if (cachedMessages) {
      console.log("Messages served from Redis ✅");
      return res.status(200).json({
        message: "Successfully got message (from cache)",
        data: JSON.parse(cachedMessages),
      });
    }

      const GetMessages = await conversations.findOne({
        participantsId:{$all:[senderId,recieverId]}
      }).populate("message")

      const AllMessages = GetMessages?.message

       await redis.setex(cacheKey, 120, JSON.stringify(AllMessages));
       console.log("Messages fetched from DB and cached ✅");
      
      return res.status(200).json({message:'Successfully got message',data:AllMessages})

   }catch(error){
      console.log('Err in convo',error)
      return res.status(500).json('error in get mesg')
   }
}