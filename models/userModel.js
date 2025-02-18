import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9_]{3,30}$/, "Please provide a valid username"],
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/deni18m0m/image/upload/v1739211632/Chatapp/akzxqvn2wgmygz9z9joq.png",
    },
    friendsList:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    isOnline: {
        type: Boolean,
        default: false,
    }
},{timestamps:true});

const User = mongoose.model("User", userSchema);

export default User;