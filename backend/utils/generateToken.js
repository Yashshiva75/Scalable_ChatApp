import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const generateToken = (userId)=>{
    try{
        const token = jwt.sign({id:userId}
        ,process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN})

    return token;
  }catch(error){
    return console.log('Error in gen token',error)
  }
}