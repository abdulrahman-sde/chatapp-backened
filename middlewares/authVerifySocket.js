import jwt from "jsonwebtoken";
import User from '../models/userModel.js'
const authVerifySocket = async (socket, next) => {
  try {
    const token = socket.handshake.headers.authorization; // Use "authorization" for consistency
    if (!token) {
      return next(new Error("Authentication invalid: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return next(new Error("Authentication invalid: Token verification failed"));
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new Error("Authentication invalid: User not found"));
    }

    // Attach user info to the socket object for future use
    socket.user = {
      _id: user._id,
      fullName:user.firstName + ' ' + user.lastName
    };

    next();
  } catch (error) {
    console.error("Socket Authentication Error:", error.message);
    return next(new Error("Authentication invalid: Token verification failed"));
  }
};

export default authVerifySocket;
