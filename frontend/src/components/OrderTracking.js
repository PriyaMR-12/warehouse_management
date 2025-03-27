import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Invoice from './documents/Invoice';
import PackingSlip from './documents/PackingSlip';

const SOCKET_URL = 'http://localhost:5001';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Listen for order updates
    newSocket.on('orderUpdate', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    // Listen for new orders
    newSocket.on('newOrder', (newOrder) => {
      setOrders(prevOrders => [...prevOrders, newOrder]);
    });

    return () => newSocket.disconnect();
  }, []);

  const handleStatusUpdate = (orderId, newStatus) => {
    socket.emit('updateOrderStatus', { orderId, status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in progress':
        return 'info';
      case 'shipped':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleUpdateDialogOpen = (order) => {
    setSelectedOrder(order);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setSelectedOrder(null);
    setIsUpdateDialogOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Order Tracking
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateDialogOpen(order)}
                  >
                    <EditIcon />
                  </IconButton>
                  <PDFDownloadLink
                    document={<Invoice order={order} />}
                    fileName={`invoice-${order.orderNumber}.pdf`}
                  >
                    {({ loading }) => (
                      <IconButton size="small" disabled={loading}>
                        <PdfIcon />
                      </IconButton>
                    )}
                  </PDFDownloadLink>
                  <PDFDownloadLink
                    document={<PackingSlip order={order} />}
                    fileName={`packing-slip-${order.orderNumber}.pdf`}
                  >
                    {({ loading }) => (
                      <IconButton size="small" disabled={loading}>
                        <ShippingIcon />
                      </IconButton>
                    )}
                  </PDFDownloadLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onClose={handleUpdateDialogClose}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Status"
            value={selectedOrder?.status || ''}
            onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderTracking; 