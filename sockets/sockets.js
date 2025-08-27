import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Conversation from '../models/conversationModel.js';
import authVerifySocket from '../middlewares/authVerifySocket.js'; // Adjust import path
import User from '../models/userModel.js'; // Ensure you import the User model

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    },
});

// Apply authentication middleware before handling socket events
io.use(authVerifySocket);

io.on('connection', (socket) => {
    console.log("user connected ", socket.user.fullName)
    // Handle subscribing to conversations
    socket.on("subscribeToConversations",(conversationIds)=>{
        conversationIds.forEach((convo)=>{
            socket.join(convo)
        })
    })


    // Handle sending messages
    socket.on("SEND_MESSAGE", async ({ conversationId, type, content }) => {
        if(!socket.user._id){
            return 
        }
        try {
            // Construct message object
            const message = {
                sender: socket.user._id,
                type,
                content,
                createdAt: new Date(),
                isSeen: false,
                isDelivered: false,
            };
            // Update conversation with new message
            const updatedConversation = await Conversation.findByIdAndUpdate(
                conversationId,
                { $push: { messages: message } },
                { new: true, fields: { messages: { $slice: -1 } } }
            ).populate({
                path: "messages.sender",
                select: "profilePic username firstName lastName", // Populate necessary fields
            });
            // Check if conversation exists
            if (!updatedConversation) {
                socket.emit("ERROR", { message: "Conversation not found", conversationId });
                return;
            }
            // Extract the latest message
            const newMessage = updatedConversation.messages[updatedConversation.messages.length - 1];
            io.to(conversationId).emit("NEW_MESSAGE", {
                message: {
                    content: newMessage.content,
                    _id: newMessage._id,
                    isDelivered: newMessage.isDelivered,
                    isSeen: newMessage.isSeen,
                    sender: newMessage.sender,
                    type: newMessage.type,
                    createdAt: newMessage.createdAt,
                },
                conversationId,
            });


        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("ERROR", { message: "Failed to send message", error: error.message });
        }
    });

    
    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

export { server, io, app };
