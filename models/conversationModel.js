import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      required: true,
      enum: ["TEXT", "IMAGE", "VIDEO", "AUDIO", "ONE_TIME"],
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    is_seen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    is_delivered: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  });

const conversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema],
    isTyping: [
        {
          participantId: { type: Schema.Types.ObjectId, ref: "User" },
          is_typing: { type: Boolean, default: false },
        },
      ],

},{timestamps:true});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;