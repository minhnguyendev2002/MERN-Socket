import { Server } from 'socket.io';

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            console.log('join room:', roomId)
        });

        socket.on("send-message", ({ roomId, userId, text, sender }) => {
            io.to(roomId).emit("recieve-message", { roomId, userId, text, sender });
            console.log(roomId, userId, sender)
        });
    })
}

export default initializeSocket;