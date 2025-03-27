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
  Alert,
  useTheme,
  alpha,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const API_URL = 'http://localhost:5001/api';

const Inventory = () => {
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const theme = useTheme();
  const [formData, setFormData] = useState({
    productId: '',
    location: '',
    quantity: '',
    minimumQuantity: '',
    maximumQuantity: '',
    notes: '',
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchProducts(); // Fetch products first
        await fetchInventory(); // Then fetch inventory
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initializeData();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get the current user's ID from the token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('No user found');
      }

      const response = await axios.get(`${API_URL}/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter inventory items to only show those added by the current user
      const userInventory = response.data.filter(item => item.userId === user._id);
      
      // Map inventory items with product details
      const inventoryWithProducts = userInventory.map(item => {
        const product = products.find(p => p._id === item.productId);
        return {
          ...item,
          productName: product ? product.name : 'Unknown Product',
          productPrice: product ? product.price : 0
        };
      });
      
      setInventory(inventoryWithProducts);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

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

  const handleOpen = () => {
    setOpen(true);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({
      productId: '',
      location: '',
      quantity: '',
      minimumQuantity: '',
      maximumQuantity: '',
      notes: '',
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId,
      location: item.location,
      quantity: item.quantity.toString(),
      minimumQuantity: item.minimumQuantity ? item.minimumQuantity.toString() : '',
      maximumQuantity: item.maximumQuantity ? item.maximumQuantity.toString() : '',
      notes: item.notes || '',
    });
    setOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API_URL}/inventory/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Remove item from local state
      setInventory(inventory.filter(item => item._id !== itemId));
      
      // Refresh the data to ensure consistency
      await fetchInventory();
      await fetchProducts();
      
      setSuccess('Inventory item deleted successfully!');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete inventory item. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.productId || !formData.location || !formData.quantity) {
        setError('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get the current user's ID
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('No user found');
      }

      // Convert quantity to number
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      const data = {
        productId: formData.productId,
        location: formData.location,
        quantity: quantity,
        minimumQuantity: formData.minimumQuantity ? parseInt(formData.minimumQuantity) : 0,
        maximumQuantity: formData.maximumQuantity ? parseInt(formData.maximumQuantity) : 0,
        notes: formData.notes,
        userId: user._id // Add the user ID to the inventory item
      };

      let response;
      if (editingItem) {
        // Update existing item
        response = await axios.put(`${API_URL}/inventory/${editingItem._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Inventory item updated successfully!');
      } else {
        // Create new item
        response = await axios.post(`${API_URL}/inventory`, data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Inventory item added successfully!');
      }

      // Add the new/updated item to the inventory list with product details
      const product = products.find(p => p._id === formData.productId);
      const updatedItem = {
        ...response.data,
        productName: product ? product.name : 'Unknown Product',
        productPrice: product ? product.price : 0
      };

      if (editingItem) {
        setInventory(inventory.map(item => 
          item._id === editingItem._id ? updatedItem : item
        ));
      } else {
        setInventory([...inventory, updatedItem]);
      }
      
      // Reset form and close dialog after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save inventory item. Please try again.');
      }
    }
  };

  const getStockStatus = (quantity, minimumQuantity) => {
    if (quantity <= 0) return { label: 'Out of Stock', color: 'error' };
    if (quantity <= minimumQuantity) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  return (
    <Box sx={{ p: 3 }}>
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
            Inventory Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track and manage your warehouse inventory
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
          Add Inventory Item
        </Button>
      </Box>

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
              <TableCell>Product</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Min Quantity</TableCell>
              <TableCell>Max Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => {
              const status = getStockStatus(item.quantity, item.minimumQuantity);
              return (
                <TableRow key={item._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹{item.productPrice.toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.minimumQuantity}</TableCell>
                  <TableCell>{item.maximumQuantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={status.label}
                      color={status.color}
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
                      onClick={() => handleEdit(item)}
                      sx={{
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.1),
                          transform: 'scale(1.1)',
                          transition: 'all 0.3s ease-in-out'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(item._id)}
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              select
              margin="dense"
              name="productId"
              label="Product"
              fullWidth
              value={formData.productId}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="">
                <em>Select a product</em>
              </MenuItem>
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name} - ₹{product.price.toLocaleString()} (Stock: {product.quantity})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="location"
              label="Location"
              fullWidth
              value={formData.location}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={formData.quantity}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="minimumQuantity"
              label="Minimum Quantity"
              type="number"
              fullWidth
              value={formData.minimumQuantity}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="maximumQuantity"
              label="Maximum Quantity"
              type="number"
              fullWidth
              value={formData.maximumQuantity}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="notes"
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory; 