import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Assessment as ReportsIcon,
  Category as ProductsIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Warning as LowStockIcon,
  CurrencyRupee as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import { fetchDashboardData } from '../features/dashboardSlice';
import OrderTracking from '../components/OrderTracking';
import StockPredictionChart from '../components/StockPredictionChart';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    totalProducts, 
    totalOrders, 
    lowStockItems, 
    totalRevenue,
    recentOrders,
    loading, 
    error 
  } = useSelector((state) => state.dashboard);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardData());
    // Refresh dashboard data every 2 minutes
    const interval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 120000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const featureCards = [
    {
      title: 'Products',
      description: 'Add, edit, and manage your product catalog',
      icon: <ProductsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      stats: `${totalProducts} Total Products`,
      path: '/products',
      action: 'Manage Products'
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: <OrdersIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      stats: `${totalOrders} Total Orders`,
      path: '/orders',
      action: 'Manage Orders'
    },
    {
      title: 'Inventory',
      description: 'Track and manage your inventory levels',
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      stats: `${lowStockItems} Low Stock Items`,
      path: '/inventory',
      action: 'Manage Inventory'
    },
    {
      title: 'Reports',
      description: 'View detailed reports and analytics',
      icon: <ReportsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      stats: `₹${(totalRevenue || 0).toLocaleString()} Total Revenue`,
      path: '/reports',
      action: 'View Reports'
    }
  ];

  const handleNavigation = (path) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      localStorage.setItem('redirectTo', path);
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  // Helper function to determine stock status
  const getStockStatus = (currentStock, reorderPoint) => {
    if (currentStock <= 0) return 'Out of Stock';
    if (currentStock <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Out of Stock':
        return 'error';
      case 'Low Stock':
        return 'warning';
      case 'In Stock':
        return 'success';
      default:
        return 'default';
    }
  };

  // Mock data for stock prediction (replace with actual data from your backend)
  const stockPredictions = [
    {
      id: 1,
      name: 'White Kurtha',
      currentStock: 15,
      reorderPoint: 20,
      avgDailyConsumption: 2,
      daysUntilStockout: 7,
      recommendedOrder: 30,
      lastUpdated: new Date()
    },
    {
      id: 2,
      name: 'Pen',
      currentStock: 5,
      reorderPoint: 10,
      avgDailyConsumption: 1,
      daysUntilStockout: 5,
      recommendedOrder: 20,
      lastUpdated: new Date()
    },
    {
      id: 3,
      name: 'Water Bottle',
      currentStock: 0,
      reorderPoint: 15,
      avgDailyConsumption: 3,
      daysUntilStockout: 0,
      recommendedOrder: 45,
      lastUpdated: new Date()
    }
  ];

  // Sample product data for stock predictions (replace with actual data from your backend)
  const productStockData = [
    {
      id: 1,
      name: "White Kurtha",
      currentStock: 15,
      reorderPoint: 20,
      avgDailyConsumption: 2
    },
    {
      id: 2,
      name: "Water Bottle",
      currentStock: 25,
      reorderPoint: 15,
      avgDailyConsumption: 3
    },
    {
      id: 3,
      name: "Pen",
      currentStock: 8,
      reorderPoint: 50,
      avgDailyConsumption: 10
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: totalProducts || 0,
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
      description: 'Total number of products in inventory'
    },
    {
      title: 'Total Orders',
      value: totalOrders || 0,
      icon: <OrdersIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
      description: 'Total number of orders placed'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems || 0,
      icon: <LowStockIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
      description: 'Products below reorder point'
    },
    {
      title: 'Total Revenue',
      value: `₹${(totalRevenue || 0).toLocaleString()}`,
      icon: <RevenueIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
      description: 'Total revenue from all orders'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Authentication Section */}
      {!isAuthenticated && (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Welcome to Warehouse Management System
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              Please login or register to access all features
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                size="large"
              >
                Login
              </Button>
              <Button
                variant="outlined"
                startIcon={<RegisterIcon />}
                onClick={() => navigate('/register')}
                size="large"
              >
                Register
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper 
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                bgcolor: 'background.default',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              elevation={3}
            >
              {card.icon}
              <Typography variant="h6" sx={{ mt: 2, color: card.color }}>
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {card.value}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center"
                sx={{ mt: 1 }}
              >
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Products Summary */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Products Overview
        </Typography>
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Total Products in Inventory: {totalProducts || 0}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
            startIcon={<InventoryIcon />}
          >
            Manage Products
          </Button>
        </Paper>
      </Box>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Orders
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: 
                            order.status === 'completed' ? 'success.main' :
                            order.status === 'pending' ? 'warning.main' :
                            'error.main'
                        }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">₹{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Feature Cards */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {featureCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" component="div" gutterBottom align="center">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" paragraph>
                  {card.description}
                </Typography>
                <Typography variant="subtitle1" color="primary" align="center">
                  {card.stats}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleNavigation(card.path)}
                  size="large"
                >
                  {card.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Order Tracking Section */}
      {isAuthenticated && <OrderTracking />}

      {/* Stock Prediction Analysis */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          Stock Prediction Analysis
        </Typography>
        <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="center">Current Stock</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Daily Consumption</TableCell>
                <TableCell align="center">Days Until Stockout</TableCell>
                <TableCell align="center">Recommended Order</TableCell>
                <TableCell align="right">Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockPredictions.map((product) => {
                const status = getStockStatus(product.currentStock, product.reorderPoint);
                const stockoutUrgency = product.daysUntilStockout <= 7 ? 'error' : 
                                      product.daysUntilStockout <= 14 ? 'warning' : 'success';
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {product.currentStock}
                        <Tooltip title={`Reorder Point: ${product.reorderPoint}`}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(product.currentStock / product.reorderPoint) * 100}
                            color={getStatusColor(status)}
                            sx={{ width: 100, ml: 1 }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                        icon={status === 'In Stock' ? <CheckIcon /> : <ErrorIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {product.avgDailyConsumption} units/day
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.daysUntilStockout === 0 ? 
                          'Out of Stock' : 
                          `${product.daysUntilStockout} days`}
                        color={stockoutUrgency}
                        size="small"
                        icon={product.daysUntilStockout <= 7 ? <TrendingDownIcon /> : <TrendingUpIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {product.recommendedOrder > 0 ? (
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/orders/new?product=${product.id}&quantity=${product.recommendedOrder}`)}
                        >
                          Order {product.recommendedOrder} units
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {new Date(product.lastUpdated).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Stock Prediction Chart */}
      <StockPredictionChart products={productStockData} />
    </Box>
  );
};

export default Dashboard; 