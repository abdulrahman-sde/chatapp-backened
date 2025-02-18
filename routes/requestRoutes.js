import { Router } from "express";
import { fetchFriendRequests, handleFriendRequest, sendFriendRequest } from "../controllers/requestControllers.js";
import authVerify from "../middlewares/authVerify.js";

const requestRouter = Router()

requestRouter.get('/', authVerify, fetchFriendRequests)
requestRouter.post('/send', authVerify, sendFriendRequest)
requestRouter.post('/handle', authVerify, handleFriendRequest)

export default requestRouter