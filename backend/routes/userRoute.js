import express from 'express'
import { Login, logout, register,getOtherUsers, editUserProfile } from '../controllers/userController.js'
import {VerifyUser} from '../Middlewares/VerifyUser.js'
const router = express.Router()


router.post('/register',register)
router.post('/login',Login)
router.post('/logout',logout)
router.get('/getUsers',VerifyUser,getOtherUsers)
router.put('/updateprofile',VerifyUser,editUserProfile)

export default router;