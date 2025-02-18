
import { Router } from "express";
import authVerify from '../middlewares/authVerify.js'
import { fetchUserConversations, getPaginatedChats } from "../controllers/chatController.js";
const chatRouter=Router()

chatRouter.get('/',authVerify,fetchUserConversations)
chatRouter.get('/messages',authVerify,getPaginatedChats)

export default chatRouter