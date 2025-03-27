const socketIO = require('socket.io');
const Order = require('./models/Order');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    // Listen for order status updates
    socket.on('updateOrderStatus', async ({ orderId, status }) => {
      try {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        ).populate('items.product');

        if (updatedOrder) {
          // Broadcast the update to all connected clients
          io.emit('orderUpdate', updatedOrder);
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

module.exports = initializeSocket; 