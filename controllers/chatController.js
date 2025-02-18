import Conversation from "../models/conversationModel.js"

const fetchUserConversations = async (req, res) => {
    const userId = req.user._id
    try {
        const conversations = await Conversation.find({
            participants: userId,
            $expr: { $gt: [{ $size: "$messages" }, 0] } // Ensures messages array length > 0

        }).populate('participants', 'firstName lastName username profilePic')
            .populate({
                path: 'messages.sender',
                select: 'firstName lastName username profilePic'
            }).sort({ updatedAt: -1 }).exec()

        const result = await Promise.all(
            conversations.map(async (convo) => {
                const latestMessage = convo.messages[convo.messages.length - 1] || null
                const otherParticipant = convo.participants.find(participant => participant._id.toString() !== userId.toString())
                const unreadCount = convo.messages.reduce((count, message) => {
                    if (
                        message.sender._id.toString() === otherParticipant._id.toString() &&
                        !message.isSeen &&
                        !message.isDeleted &&
                        !message.deletedFor.includes(userId)
                    ) {
                        return count + 1;
                    }
                    return count;
                }, 0);
                return {
                    conversationId: convo._id,
                    otherParticipant: {
                        _id: otherParticipant._id,
                        username: otherParticipant.username,
                        fullName: otherParticipant.firstName + ' ' + otherParticipant.lastName,
                        profilePic: otherParticipant.profilePic,
                    },
                    messages:
                        latestMessage &&
                            !latestMessage.isDeleted &&
                            !latestMessage.deletedFor.includes(userId) ?
                            [
                                {
                                    _id: latestMessage._id,
                                    type: latestMessage.type,
                                    content: latestMessage.isDeleted
                                        ? "This message was deleted"
                                        : latestMessage.content,
                                    isSeen: latestMessage.isSeen,
                                    isDelivered: latestMessage.isDelivered,
                                    sender: {
                                        _id: latestMessage.sender._id,
                                        fullName: latestMessage.sender.firstName + ' ' + latestMessage.sender.lastName,
                                        username: latestMessage.sender.username,
                                        profilePic: latestMessage.sender.profilePic
                                    },
                                    createdAt: latestMessage.createdAt
                                }
                            ] : [],
                    unreadMessages: unreadCount,
                }
            })
        )
        res.status(200).json({
            data:result,
            message:"Conversation fetched successfully"
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            data: null,
            message: "error fetching conversations",
        })
    }

}

const getPaginatedChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationId} = req.query;

        // const { conversationId, page = 1 } = req.query;
        // const pageSize = 10;
        // const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;

        // Find and populate conversation
        const existingConversation = await Conversation.findById(conversationId)
            .populate("messages.sender", "username firstName lastName profilePic")
            .lean();

        if (!existingConversation) {
            return res.status(400).json({
                data: null,
                message: "Conversation not exists",
            });
        }

        // Filter and sort messages
        const totalMessages = existingConversation.messages
            .filter(message => !message.isDeleted && !message.deletedFor.includes(userId))
            // .sort((a, b) => b.createdAt - a.createdAt); // Descending order

        // Calculate pagination
        // const totalCount = totalMessages.length;
        // const totalPages = Math.ceil(totalCount / pageSize);
        // const startIndex = (pageNumber - 1) * pageSize;

        // Get paginated messages
        // const paginatedMessages = totalMessages.slice(startIndex, startIndex + pageSize);

        return res.status(200).json({
            data: {
                messages: totalMessages,
                // currentPage: pageNumber,
                // totalPages,
                
            },
            message: "Messages fetched successfully"
        });

    } catch (error) {
        console.error('Error fetching paginated chats:', error);
        return res.status(500).json({
            data: null,
            message: "Internal server error"
        });
    }
};



export {
    fetchUserConversations,
    getPaginatedChats
}