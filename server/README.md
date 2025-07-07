# FlockShop Server

This is the backend server for the FlockShop application.

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=5001
MONGODB_URI=mongodb://your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Environment Variables Explanation:

- `PORT`: The port on which the server will run (default: 5001)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation and verification
- `NODE_ENV`: Application environment (development, production, etc.)

**Important**: Never commit your actual `.env` file to version control. It contains sensitive information like database credentials and secrets.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Create your `.env` file as described above

3. Start the server:
   ```
   npm start
   ```

## API Documentation

The server provides RESTful APIs for user authentication, wishlist management, and real-time collaboration.

### Authentication
All wishlist routes, including the /join endpoint, are protected by authentication middleware. The client must include a valid JWT token in the request header when making API calls to wishlist endpoints.
