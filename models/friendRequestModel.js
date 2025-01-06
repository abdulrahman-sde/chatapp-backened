import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
},{timestamps:true});

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;