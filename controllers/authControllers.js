import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
    try {
        const { username, email, password, profilePic,firstName,lastName } = req.body;
        if (!username || !email || !password  || !firstName || !lastName) {
            return res.status(400).json({
                data: null,
                error: true,
                message: "Please enter all fields",
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                data: null,
                error: true,
                message: "User already exists",
            });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({
                data: null,
                error: true,
                message: "Username already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic
        });

        newUser.save();

        res.status(201).json({
            data: newUser,
            message: "User created successfully",
        });

    }
    catch (error) {
        res.status(409).json({
            data: null,
            message: "Failed to create user",
            error: error.message
        });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                data: null,
                error: true,
                message: "Please enter all fields",
            });
        }
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                data: null,
                error: true,
                message: "User does not exist",
            });
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                data: null,
                error: true,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign({ _id: existingUser._id, email: existingUser.email }, process.env.SECRET_KEY);

        res.status(200).json({
            data: {
                user: {
                    _id: existingUser._id,
                    username: existingUser.username,
                    firstName: existingUser.firstName,
                    lastName: existingUser.lastName,
                    email: existingUser.email,
                    profilePic: existingUser.profilePic,
                    friendsList: existingUser.friendsList,
                    isOnline: existingUser.isOnline
                },
                token: token
            },
            message: "User logged in successfully",
        });
    }
    catch (error) {
        res.status(409).json({
            data: null,
            message: "Failed to login",
            error: error.message
        });
    }
}



export { registerUser, loginUser };