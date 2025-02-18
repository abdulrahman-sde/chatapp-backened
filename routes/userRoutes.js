import { Router } from "express";
import { fetchFriendsList, fetchUserDetails, searchByUserNameOrName } from "../controllers/userControllers.js";
import authVerify from "../middlewares/authVerify.js";

const userRouter=Router()
userRouter.get('/me',authVerify,fetchUserDetails)
userRouter.get('/connected',authVerify,fetchFriendsList)
userRouter.get('/search/:query',authVerify,searchByUserNameOrName)

export default userRouter