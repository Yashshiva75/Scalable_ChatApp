import express, { Router } from 'express'
import { getMessages, sendMessage } from '../controllers/MessageController.js';
import { VerifyUser } from '../Middlewares/VerifyUser.js';

const router = express.Router()

router.post('/sendmessage/:id',VerifyUser,sendMessage)
router.get('/getmessages/:id',VerifyUser,getMessages)

export default router;