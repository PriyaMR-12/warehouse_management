import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productSlice';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.products);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    reorderPoint: '',
    location: '',
  });

  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        localStorage.setItem('redirectTo', '/products');
        navigate('/login');
      }
    };

    checkAuth();
    dispatch(fetchProducts()).unwrap()
      .catch((error) => {
        if (error.includes('Please log in')) {
          localStorage.setItem('redirectTo', '/products');
          navigate('/login');
        }
      });
  }, [dispatch, navigate]);

  const handleOpen = (product = null) => {
    setFormError(null);
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        quantity: '',
        reorderPoint: '',
        location: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormError(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      price: '',
      cost: '',
      quantity: '',
      reorderPoint: '',
      location: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name || !formData.sku || !formData.category || 
        !formData.price || !formData.cost || !formData.quantity || 
        !formData.reorderPoint || !formData.location) {
      setFormError('Please fill in all required fields');
      return false;
    }
    if (formData.price < 0 || formData.cost < 0 || formData.quantity < 0 || formData.reorderPoint < 0) {
      setFormError('Price, cost, quantity, and reorder point must be non-negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Convert string values to numbers for numeric fields
      const numericFormData = {
        ...formData,
        price: Number(formData.price),
        cost: Number(formData.cost),
        quantity: Number(formData.quantity),
        reorderPoint: Number(formData.reorderPoint),
      };

      console.log('Submitting product data:', numericFormData);

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, productData: numericFormData })).unwrap();
        console.log('Product updated successfully');
      } else {
        const result = await dispatch(createProduct(numericFormData)).unwrap();
        console.log('Product created successfully:', result);
      }
      
      // Refresh the products list
      await dispatch(fetchProducts()).unwrap();
      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
      if (typeof error === 'string' && error.includes('Please log in')) {
        navigate('/login');
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || error || 'Failed to save product';
        setFormError(errorMessage);
        console.error('Failed to save product:', errorMessage);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.location}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              name="name"
              label="Product Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="sku"
              label="SKU"
              fullWidth
              value={formData.sku}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="category"
              label="Category"
              fullWidth
              value={formData.category}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="cost"
              label="Cost"
              type="number"
              fullWidth
              value={formData.cost}
              onChange={handleChange}
              required
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
            />
            <TextField
              margin="dense"
              name="reorderPoint"
              label="Reorder Point"
              type="number"
              fullWidth
              value={formData.reorderPoint}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="location"
              label="Location"
              fullWidth
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products; 