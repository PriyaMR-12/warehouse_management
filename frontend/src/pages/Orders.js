import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fade,
  Grow,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';

const API_URL = 'http://localhost:5001/api';

const Orders = () => {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
    },
    items: [],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Fetch products when component mounts
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    // Fetch existing orders
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    fetchProducts();
    fetchOrders();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      customer: { name: '', email: '', phone: '' },
      items: [],
      shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    });
    setSelectedProducts([]);
    setSelectedProductId('');
    setSelectedQuantity('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleProductSelect = (productId, quantity) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existingProductIndex = selectedProducts.findIndex(item => item.product === productId);
    
    if (existingProductIndex >= 0) {
      // Update existing product quantity
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        quantity: parseInt(quantity) || 0
      };
      setSelectedProducts(updatedProducts);
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, {
        product: productId,
        quantity: parseInt(quantity) || 0,
        price: product.price
      }]);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId || !selectedQuantity) {
      alert('Please select a product and enter a quantity');
      return;
    }

    const selectedProduct = products.find(p => p._id === selectedProductId);
    if (!selectedProduct) {
      alert('Selected product not found');
      return;
    }

    const quantity = parseInt(selectedQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (quantity > selectedProduct.quantity) {
      alert('Quantity exceeds available stock');
      return;
    }

    handleProductSelect(selectedProductId, quantity);
    setSelectedProductId('');
    setSelectedQuantity('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate form data
      if (!formData.customer.name || !formData.shippingAddress.street) {
        alert('Please fill in all required fields');
        return;
      }

      if (selectedProducts.length === 0) {
        alert('Please select at least one product');
        return;
      }

      // Validate product quantities
      for (const item of selectedProducts) {
        if (!item.quantity || item.quantity < 1) {
          alert('Please enter valid quantities for all products');
          return;
        }
      }

      const orderData = {
        ...formData,
        items: selectedProducts
      };

      console.log('Submitting order data:', JSON.stringify(orderData, null, 2)); // More detailed debug log

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Order created successfully:', response.data);
      
      // Refresh orders list
      const ordersResponse = await axios.get(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(ordersResponse.data);
      
      handleClose();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response?.data); // Add error response logging
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to create order. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={500}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          background: alpha(theme.palette.primary.main, 0.05),
          p: 3,
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Orders Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage and track all your warehouse orders
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            New Order
          </Button>
        </Box>
      </Fade>

      <Grow in timeout={800}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: 2,
            overflow: 'hidden',
            '& .MuiTableCell-root': {
              py: 2,
              px: 3,
              fontWeight: 500
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <Slide 
                  direction="up" 
                  in 
                  timeout={500} 
                  key={order._id}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <TableRow 
                    sx={{ 
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          px: 1,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => {}}
                        sx={{
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'scale(1.1)',
                            transition: 'all 0.3s ease-in-out'
                          }
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </Slide>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grow>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ 
          background: alpha(theme.palette.primary.main, 0.05),
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CartIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Create New Order
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Customer Information
            </Typography>
            <TextField
              margin="dense"
              name="customer.name"
              label="Customer Name"
              fullWidth
              value={formData.customer.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="customer.email"
              label="Email"
              fullWidth
              value={formData.customer.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="customer.phone"
              label="Phone"
              fullWidth
              value={formData.customer.phone}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Shipping Address
            </Typography>
            <TextField
              margin="dense"
              name="shippingAddress.street"
              label="Street Address"
              fullWidth
              value={formData.shippingAddress.street}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="shippingAddress.city"
              label="City"
              fullWidth
              value={formData.shippingAddress.city}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="shippingAddress.state"
              label="State"
              fullWidth
              value={formData.shippingAddress.state}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="shippingAddress.zipCode"
              label="ZIP Code"
              fullWidth
              value={formData.shippingAddress.zipCode}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="shippingAddress.country"
              label="Country"
              fullWidth
              value={formData.shippingAddress.country}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Products
            </Typography>
            <Box sx={{ mb: 2 }}>
              {selectedProducts.map((item, index) => {
                const product = products.find(p => p._id === item.product);
                return (
                  <Grow in timeout={500} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      background: alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}>
                      <Typography sx={{ flex: 1, fontWeight: 500 }}>{product?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹{(item.productPrice || 0).toLocaleString()}
                      </Typography>
                      <TextField
                        margin="dense"
                        label="Quantity"
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleProductSelect(item.product, e.target.value)}
                        sx={{ width: 100, mx: 1 }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
                        }}
                        sx={{
                          '&:hover': {
                            background: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                            transform: 'scale(1.1)',
                            transition: 'all 0.3s ease-in-out'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grow>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                select
                label="Select Product"
                fullWidth
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">
                  <em>Select a product</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} - ${product.price} (Stock: {product.quantity})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Quantity"
                type="number"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                sx={{ width: 100, mb: 2 }}
                inputProps={{ min: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddProduct}
                disabled={!selectedProductId || !selectedQuantity}
                sx={{ 
                  minWidth: '100px',
                  mb: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          borderTop: 1,
          borderColor: 'divider',
          background: alpha(theme.palette.primary.main, 0.05)
        }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                background: alpha(theme.palette.error.main, 0.1),
                color: 'error.main'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 