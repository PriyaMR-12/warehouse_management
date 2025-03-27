import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import dashboardReducer from './features/dashboardSlice';
import productReducer from './features/productSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productReducer,
  },
}); 