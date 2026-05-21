import { io } from 'socket.io-client';
const SERVER = process.env.BACKEND_URL || 'http://localhost:3000';
async function run() {
    console.log('Starting socket test against', SERVER);
    const socket = io(SERVER, { transports: ['websocket'] });
    socket.on('connect', () => {
        console.log('connected', socket.id);
        socket.emit('joinRoom', 'responder');
    });
    socket.on('emergency:created', (payload) => {
        console.log('emergency:created', payload);
    });
    socket.on('emergency:assigned', (payload) => {
        console.log('emergency:assigned', payload);
    });
    socket.on('disconnect', () => {
        console.log('disconnected');
    });
    // keep alive for 30s
    setTimeout(() => {
        socket.close();
        process.exit(0);
    }, 30000);
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
