import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import userRoute from './routes/userRoute.js'
import MessageRoutes from './routes/MessageRoutes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import  {connectDb}  from './config/database.js'
import { initSocket } from './socketServer/socketServer.js'
dotenv.config()

const app = express()
const server = http.createServer(app); 

app.use(express.json(
    {limit:'50mb'}
))

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true 
}));

app.use(cookieParser());

app.use(cors({
    origin:"https://chatflow-gsx8.onrender.com/",
    credentials:true
}))

app.use('/api',userRoute)
app.use('/api',MessageRoutes)

initSocket(server)

const PORT = process.env.PORT 

server.listen(PORT,()=>{
    connectDb()
    console.log(`Server started at port ${PORT}`)
})
