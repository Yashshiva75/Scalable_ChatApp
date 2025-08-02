import { Server } from 'socket.io'


let io;
const connectedUsers = {}; // { userId: socket.id }


export const initSocket = (server) => {
  const allowedOrigins = [
  "http://localhost:5173",
  "https://chatflow-gsx8.onrender.com"
];

io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});


  io.on('connection', (socket) => {
    console.log('✅ New user connected:', socket.id);

    socket.on('join',(userId)=>{
      socket.join(userId)
      console.log(`User ${userId} joined socket room`);
    })

     socket.on('sendMessage', (data) => {
      const { receiverId, message, senderId, time } = data;

      const formattedMessage = {
        senderId,
        receiverId,
        message,
        time,
        text: message, // 👈 Add text field for frontend display
      };

      console.log('📩 Sending message to:', receiverId);
      io.to(receiverId).emit('receiveMessage', formattedMessage);
    }); 

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
  return io;
};


export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
