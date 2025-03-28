import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  Inventory,
  Payment,
  CheckCircle
} from '@mui/icons-material';

const OrderTracking = () => {
  // Dummy order tracking data
  const recentOrders = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      date: "2024-03-15",
      status: "Delivered",
      items: [
        { name: "White Kurtha", quantity: 5, price: 1500 },
        { name: "Water Bottle", quantity: 10, price: 200 }
      ],
      totalAmount: 9500,
      timeline: [
        { status: "Order Placed", date: "2024-03-15 10:00 AM", completed: true },
        { status: "Payment Confirmed", date: "2024-03-15 10:30 AM", completed: true },
        { status: "Processing", date: "2024-03-15 11:00 AM", completed: true },
        { status: "Shipped", date: "2024-03-15 02:00 PM", completed: true },
        { status: "Delivered", date: "2024-03-15 05:00 PM", completed: true }
      ]
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      date: "2024-03-16",
      status: "Processing",
      items: [
        { name: "Pen", quantity: 100, price: 10 },
        { name: "Water Bottle", quantity: 5, price: 200 }
      ],
      totalAmount: 2000,
      timeline: [
        { status: "Order Placed", date: "2024-03-16 09:00 AM", completed: true },
        { status: "Payment Confirmed", date: "2024-03-16 09:30 AM", completed: true },
        { status: "Processing", date: "2024-03-16 10:00 AM", completed: true },
        { status: "Shipped", date: "", completed: false },
        { status: "Delivered", date: "", completed: false }
      ]
    },
    {
      id: 3,
      orderNumber: "ORD-2024-003",
      date: "2024-03-16",
      status: "Payment Pending",
      items: [
        { name: "White Kurtha", quantity: 2, price: 1500 }
      ],
      totalAmount: 3000,
      timeline: [
        { status: "Order Placed", date: "2024-03-16 11:00 AM", completed: true },
        { status: "Payment Confirmed", date: "", completed: false },
        { status: "Processing", date: "", completed: false },
        { status: "Shipped", date: "", completed: false },
        { status: "Delivered", date: "", completed: false }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'payment pending':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalShipping color="primary" />
        Order Tracking
      </Typography>

      <Grid container spacing={3}>
        {recentOrders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Order #{order.orderNumber}
                  </Typography>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="medium"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(order.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="body1">
                      ₹{order.totalAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Items
                    </Typography>
                    <Typography variant="body1">
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Stepper activeStep={order.timeline.filter(step => step.completed).length}>
                  {order.timeline.map((step, index) => (
                    <Step key={index} completed={step.completed}>
                      <StepLabel>
                        <Typography variant="caption">
                          {step.status}
                          {step.date && (
                            <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', color: 'text.secondary' }}>
                              {step.date}
                            </Box>
                          )}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OrderTracking; 