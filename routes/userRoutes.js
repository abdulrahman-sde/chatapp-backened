import { Router } from "express";
import { fetchFriendsList, searchByUserNameOrName } from "../controllers/userControllers.js";
import authVerify from "../middlewares/auth.js";

const userRouter=Router()

userRouter.get('/connected',authVerify,fetchFriendsList)
userRouter.get('/search/:query',authVerify,searchByUserNameOrName)

export default userRouter