import {conversations} from '../models/conversations.js'
import { message } from '../models/messageSchema.js';
export const sendMessage = async(req,res)=>{
  console.log('Api hit')
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
      return res.status(500).json('Error in api')
    }
}

export const getMessages = async(req,res)=>{
   try{
      const senderId = req.user;
      const recieverId = req.params.id;

      const GetMessages = await conversations.findOne({
        participantsId:{$all:[senderId,recieverId]}
      }).populate("message")
      console.log('Messages',GetMessages)

      return res.status(200).json('Successfully got message')

   }catch(error){
      return res.status(500).json('error in get mesg')
   }
}