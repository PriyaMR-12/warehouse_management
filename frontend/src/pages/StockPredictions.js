import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { API_URL } from '../config';

const StockPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    healthyStock: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setError('Please login to view predictions');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/predictions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      setPredictions(data.predictions);
      
      // Calculate summary statistics
      const summaryData = {
        totalProducts: data.predictions.length,
        lowStock: data.predictions.filter(p => p.status === 'low').length,
        outOfStock: data.predictions.filter(p => p.status === 'out').length,
        healthyStock: data.predictions.filter(p => p.status === 'healthy').length,
        totalValue: data.predictions.reduce((sum, p) => sum + (p.currentStock * p.price), 0),
      };
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'warning';
      case 'out':
        return 'error';
      case 'healthy':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'low':
        return <WarningIcon color="warning" />;
      case 'out':
        return <ErrorIcon color="error" />;
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low':
        return 'Low Stock';
      case 'out':
        return 'Out of Stock';
      case 'healthy':
        return 'Healthy';
      default:
        return status;
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
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Stock Predictions
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-powered inventory forecasting and stock level analysis
          </Typography>
        </Box>
        <Tooltip title="Refresh Predictions">
          <IconButton onClick={fetchPredictions} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'background.default' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">Total Products</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'background.default' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="warning.main">Low Stock</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {summary.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'background.default' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="error">Out of Stock</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {summary.outOfStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'background.default' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">Total Value</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                ₹{summary.totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Status Distribution */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>Stock Status Distribution</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Healthy Stock</Typography>
                <Typography variant="body2">{summary.healthyStock}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(summary.healthyStock / summary.totalProducts) * 100} 
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Low Stock</Typography>
                <Typography variant="body2">{summary.lowStock}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(summary.lowStock / summary.totalProducts) * 100} 
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Out of Stock</Typography>
                <Typography variant="body2">{summary.outOfStock}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(summary.outOfStock / summary.totalProducts) * 100} 
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Predictions Table */}
      <Paper sx={{ bgcolor: 'background.default' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Detailed Predictions</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Daily Consumption</TableCell>
                <TableCell align="right">Days Until Stockout</TableCell>
                <TableCell align="right">Recommended Order</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction._id}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(prediction.status)}
                      <Typography sx={{ ml: 1 }}>{prediction.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{prediction.currentStock}</TableCell>
                  <TableCell align="right">{prediction.dailyConsumption.toFixed(2)}</TableCell>
                  <TableCell align="right">{prediction.daysUntilStockout.toFixed(1)}</TableCell>
                  <TableCell align="right">{prediction.recommendedOrder}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusText(prediction.status)}
                      color={getStatusColor(prediction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {new Date(prediction.lastUpdated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StockPredictions; 