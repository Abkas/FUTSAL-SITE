// require('dotenv').config({path: './.env'})

import mongoose from 'mongoose'
import {DB_NAME} from './constants.js'
import express from 'express'
import connectDB from './db/index.js'

import {app} from './app.js'
import { setupScheduler } from './utils/scheduler.js';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Message from './models/message.model.js';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });



connectDB()
.then(() =>{
    setupScheduler();
    const server = createServer(app);
    const io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      // Join a room for the userId
      socket.on('join', (userId) => {
        socket.join(userId);
      });

      // Handle sending a message
      socket.on('chat:send', async ({ sender, recipient, text }) => {
        // Save message to DB
        const message = await Message.create({ sender, recipient, text });
        // Emit to recipient and sender
        io.to(recipient).to(sender).emit('chat:receive', {
          _id: message._id,
          sender,
          recipient,
          text,
          createdAt: message.createdAt,
        });
      });
    });

    server.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
})
.catch((error) => {
    console.error('MONGO DB CONNECTION FAILED!!!!', error);
    throw error;
})



// const app = express()
// (async () =>{
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log('app not able to connect to db')
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })

//     }catch(error){
//         conole.error('ERROR:',error)
//         throw error
//     }
// })