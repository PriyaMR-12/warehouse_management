import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Prediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePrediction = async () => {
    try {
      setLoading(true);
      setError('');
      
      // TODO: Implement API call to get predictions
      // const response = await axios.post('/api/predictions', {
      //   productId: selectedProduct,
      //   timeframe: parseInt(timeframe),
      // });
      
      // Temporary mock data
      const mockData = Array.from({ length: parseInt(timeframe) }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        predicted: Math.floor(Math.random() * 100) + 50,
        actual: Math.floor(Math.random() * 100) + 50,
      }));
      
      setPredictions(mockData);
    } catch (err) {
      setError(err.message || 'Failed to get predictions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: 'primary.main',
          fontWeight: 600,
          mb: 4,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        Stock Prediction
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)',
              border: '1px solid rgba(224, 122, 95, 0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'primary.light',
                mb: 3,
              }}
            >
              Prediction Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <TextField
                label="Timeframe (days)"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handlePrediction}
                disabled={loading || !selectedProduct}
                sx={{
                  mt: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #E07A5F 30%, #C1666B 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #C1666B 30%, #E07A5F 90%)',
                  },
                }}
              >
                {loading ? 'Generating...' : 'Generate Prediction'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)',
              border: '1px solid rgba(224, 122, 95, 0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'primary.light',
                mb: 3,
              }}
            >
              Prediction Results
            </Typography>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  background: 'rgba(211, 47, 47, 0.1)',
                  border: '1px solid rgba(211, 47, 47, 0.2)',
                }}
              >
                {error}
              </Alert>
            )}
            {loading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress 
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(224, 122, 95, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #E07A5F 30%, #C1666B 90%)',
                    },
                  }}
                />
              </Box>
            )}
            {predictions.length > 0 && (
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={predictions}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#B0B0B0"
                      tick={{ fill: '#B0B0B0' }}
                    />
                    <YAxis 
                      stroke="#B0B0B0"
                      tick={{ fill: '#B0B0B0' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#2D2D2D',
                        border: '1px solid #3D3D3D',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#E0E0E0' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        color: '#B0B0B0',
                        paddingTop: '20px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#E07A5F"
                      name="Predicted Stock"
                      strokeWidth={2}
                      dot={{ fill: '#E07A5F', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#81B29A"
                      name="Actual Stock"
                      strokeWidth={2}
                      dot={{ fill: '#81B29A', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Prediction; 