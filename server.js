import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

const PORT = process.env.PORT || 4000;

// Imports 
import { db_connection } from './configs/db_connection.js';
import { app, server } from './sockets/sockets.js';
import { authRouter } from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import requestRouter from './routes/requestRoutes.js';
import chatRouter from './routes/chatRoute.js';


// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Configs
dotenv.config();
db_connection()



// Routes
app.use('/auth',authRouter)
app.use('/users',userRouter)
app.use('/requests',requestRouter)
app.use('/chat',chatRouter)


// Server
app.get('/', (req, res) => {
    res.send('Hello World');
})
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})


