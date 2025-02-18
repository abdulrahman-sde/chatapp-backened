import User from '../models/userModel.js'
import FriendRequest from '../models/friendRequestModel.js'
import Conversation from '../models/conversationModel.js'

const fetchUserDetails = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                data: null,
                error: true,
                message: "Invalid Token"
            })
        }
        res.status(200).json({
            data: {
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.firstName + " " + user.lastName,
                email: user.email,
                profilePic: user.profilePic,
                friendsList: user.friendsList,
                isOnline: user.isOnline
            },

            message: "User logged in successfully",
        });
    }
    catch (err) {
        res.status(404).json({
            data: null,
            error: err,
            message: "Error fetching user details"
        })
    }
}



const searchByUserNameOrName = async (req, res) => {
    try {
        const { query } = req.params
        const userId = req.user._id


        if (!userId) {
            return res.status(400).json({
                message: "User not authenticated"
            })

        }

        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } }
            ]
        }).limit(10)

        const friendRequests = await FriendRequest.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: "PENDING"
        })

        const requestedUserIds = []
        const receivedUserIds = []

        friendRequests.forEach((request) => {
            if (request.sender.toString() === userId) {
                requestedUserIds.push(request.receiver.toString())
            } else {
                receivedUserIds.push(request.sender.toString())
            }
        })


        const data = users.map((user) => {
            return {
                _id: user._id,
                fullName: user.firstName + " " + user.lastName,
                username: user.username,
                profilePic: user.profilePic,
                is_online: user.isOnline,
                is_connected: user.friendsList.includes(userId),
                is_requested: requestedUserIds.includes(user._id.toString()),
                has_requested: receivedUserIds.includes(user._id.toString()),
            }
        })
        res.status(200).json({
            data,
            message: "List of user searched"
        })
    }
    catch (err) {
        res.status(409).json({
            data: null,
            message: "Error searching users",
            err
        })
    }
}

const fetchFriendsList = async (req, res) => {
    const userId = req.user._id
    try {
        const user = await User.findById(userId).populate("friendsList", "firstName lastName username profilePic isOnline")

        const friendsList = await Promise.all(
            user.friendsList.map(async (friend) => {
                const conversation = await Conversation.findOne({
                    participants: { $all: [userId, friend._id] }
                }).select("_id")
                return {
                    _id: friend._id,
                    username: friend.userName,
                    fullName: friend.firstName + " " + friend.lastName,
                    profilePic: friend.profilePic,
                    conversationId: conversation._id,
                    isOnline: friend.isOnline
                }
            })


        )
        res.status(200).json({
            data: friendsList,
            message: "Friends list fetched successfully",
        })

    }
    catch (err) {
        res.status(409).json({
            data: null,
            message: "Error fetching friend list",
            error: err
        })
    }
}


export {
    fetchUserDetails,
    searchByUserNameOrName,
    fetchFriendsList
}
