import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StockPredictionChart = ({ products }) => {
  // Calculate predicted stock for next 7 days based on daily consumption
  const generatePredictionData = (product) => {
    const days = ['Today'];
    const actualStock = [product.currentStock];
    const predictedStock = [product.currentStock];
    
    for (let i = 1; i <= 7; i++) {
      days.push(`Day ${i}`);
      const predicted = Math.max(0, product.currentStock - (product.avgDailyConsumption * i));
      predictedStock.push(predicted);
      actualStock.push(null); // We only have current stock for today
    }

    return { days, actualStock, predictedStock };
  };

  const chartData = (product) => {
    const { days, actualStock, predictedStock } = generatePredictionData(product);
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Current Stock',
          data: actualStock,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Predicted Stock',
          data: predictedStock,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Level Prediction (7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Stock Quantity'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Timeline'
        }
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Stock Level Predictions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {products.map((product) => (
          <Paper 
            key={product.id} 
            sx={{ 
              p: 2, 
              flexGrow: 1, 
              minWidth: 300,
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line 
                data={chartData(product)} 
                options={options} 
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current Stock: {product.currentStock} units
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Consumption: {product.avgDailyConsumption} units/day
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reorder Point: {product.reorderPoint} units
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default StockPredictionChart; 