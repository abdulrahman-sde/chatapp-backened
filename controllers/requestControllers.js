import Conversation from "../models/conversationModel.js"
import FriendRequest from "../models/friendRequestModel.js"
import User from "../models/userModel.js"

const sendFriendRequest = async (req, res) => {
    const senderId = req.user._id
    const { receiverId } = req.body


    try {
        if (!receiverId) {
            return res.status(409).json({
                data: null,
                message: "Receiver Id is required"
            })
        }
        if (receiverId === senderId) {
            return res.status(409).json({
                data: null,
                message: "You cannot request yourself"
            })
        }

        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId
        })

        if (existingRequest?.status === 'PENDING') {
            return res.status(409).json({
                data: null,
                message: "Friend request already sent"
            })
        }

        const friendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId
        })
        await friendRequest.save()

        return res.status(200).json({
            message: "Request Sent Successfully"
        })
    }
    catch (err) {
        return res.status(409).json({
            data: null,
            error: err,
            message: "Error Sending request"
        })
    }
}

const handleFriendRequest = async (req, res) => {
    const userId = req.user._id
    const { action, requestId } = req.body

    if (!requestId || !action) {
        return res.status(409).json({
            data: null,
            message: "Request Id and action are required",

        })
    }
    if (!["ACCEPT", "REJECT"].includes(action)) {
        return res.status(409).json({
            data: null,
            message: "Action must be ACCEPT or REJECT"
        })
    }
    try {
        const friendRequest = await FriendRequest.findById(requestId)
        if (friendRequest.receiver.toString() !== userId.toString()) {
            res.status(400).json({
                data: null,
                message: "You are not authorized to take action"
            })
        }
        if (action === "ACCEPT") {
            friendRequest.status = "ACCEPTED"
            await friendRequest.save()

            await User.findByIdAndUpdate(friendRequest.sender, {
                $addToSet: { friendsList: friendRequest.receiver },
            });
            await User.findByIdAndUpdate(friendRequest.receiver, {
                $addToSet: { friendsList: friendRequest.sender },
            });
            const existingConversation = await Conversation.findOne({
                participants: { $all: [friendRequest.sender, friendRequest.receiver] },
            });

            if (!existingConversation) {
                await Conversation.create({
                    participants: [friendRequest.sender, friendRequest.receiver],
                });
            }
            res.status(200).json({
                message:"Friend Request ACCEPTED"
            })

        }else if(action==="REJECT"){
            friendRequest.status="REJECTED"
            await friendRequest.save()
            res.status(200).json(
                {
                    message:"Friend Requested Rejected"
                }
            )
        }
    }
    catch(err){
        console.log(err)
        res.status(400).json({
            data:null,
            message:"Error handling request",
            err
        })
    }
}


const fetchFriendRequests = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const friendRequests = await FriendRequest.find({
        receiver: userId,
        status: "PENDING",
      }).populate("sender", "firstName lastName username profilePic");
  
      return res.status(200).json({
        data:friendRequests,
        message:"Friend Requests fetched successfully"
      });
    } catch (err) {
      res.status(400).json({
        data:null,
        message:"Error fetching Friends Requests",
        error:err
      })
    }
  };
export {
    sendFriendRequest,
    handleFriendRequest,
    fetchFriendRequests
}