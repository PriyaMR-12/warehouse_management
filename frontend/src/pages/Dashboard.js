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
  TableCell,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Assessment as ReportsIcon,
  Category as ProductsIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { fetchDashboardData } from '../features/dashboardSlice';
import OrderTracking from '../components/OrderTracking';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    totalProducts = 0, 
    totalOrders = 0, 
    lowStockItems = 0, 
    totalRevenue = 0, 
    loading, 
    error 
  } = useSelector((state) => state.dashboard);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardData());
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
        Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" color="primary">Total Products</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {totalProducts.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" color="primary">Total Orders</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {totalOrders.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" color="primary">Low Stock Items</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {lowStockItems.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" color="primary">Total Revenue</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ₹{(totalRevenue || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default Dashboard; 