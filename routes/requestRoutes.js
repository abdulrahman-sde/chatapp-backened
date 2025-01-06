import { Router } from "express";
import { fetchFriendRequests, handleFriendRequest, sendFriendRequest } from "../controllers/requestControllers.js";
import authVerify from "../middlewares/auth.js";

const requestRouter=Router()

requestRouter.post('/send',authVerify,sendFriendRequest)
requestRouter.post('/handle',authVerify,handleFriendRequest)
requestRouter.get('/fetch',authVerify,fetchFriendRequests)

export default requestRouter