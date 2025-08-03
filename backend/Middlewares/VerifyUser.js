import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const VerifyUser = async(req,res,next)=>{
    try{
      const token = req.cookies;
      console.log('token in middleware',token)
      if(!token){
        return res.status(404).json('User not verified!')
      }

      //verify token
      const decoded = jwt.verify(token,process.env.JWT_SECRET)
      if(!decoded){
        return res.status(404).json('Token not authorized!')
      }

      req.user = decoded.id
      next()
    }catch(error){
        console.log('Error',error)
         return res.status(500).json('Error in verifyuser')
    }
}
