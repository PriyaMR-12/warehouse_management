# Warehouse Management System

A full-stack warehouse management system built with React, Node.js, and MongoDB.

## Features

- User Authentication (Login/Register)
- Product Management
- Order Management
- Inventory Tracking
- Real-time Updates
- Dashboard with Analytics
- Responsive Design

## Tech Stack

### Frontend
- React.js
- Material-UI
- Redux Toolkit
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Socket.IO

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/warehouse-management.git
cd warehouse-management
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create .env files
- Create `.env` in the backend directory:
```
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. Start the application
```bash
# Start backend server
cd backend
npm start

# Start frontend development server
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Project Structure

```
warehouse-management/
├── frontend/           # React frontend application
└── backend/           # Node.js backend application
```

## API Endpoints

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/products - Get all products
- POST /api/products - Create a new product
- PUT /api/products/:id - Update a product
- DELETE /api/products/:id - Delete a product
- GET /api/inventory - Get inventory status
- POST /api/orders - Create a new order
- GET /api/orders - Get all orders
- GET /api/reports - Generate reports 