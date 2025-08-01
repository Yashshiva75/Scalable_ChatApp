import express from 'express'
const app = express()
import dotenv from 'dotenv'
import userRoute from './routes/userRoute.js'
import MessageRoutes from './routes/MessageRoutes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import  {connectDb}  from './config/database.js'
dotenv.config()

app.use(express.json())
app.use(cookieParser());

app.use(cors({
    origin:"https://chatflow-gsx8.onrender.com/",
    credentials:true
}))

app.use('/api',userRoute)

app.use('/api',MessageRoutes)

const PORT = process.env.PORT 

app.listen(PORT,()=>{
    connectDb()
    console.log(`Server started at port ${PORT}`)
})
