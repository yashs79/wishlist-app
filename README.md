# FlockShop - Shared Wishlist App

A real-time collaborative wishlist application where multiple users can create, manage, and interact with wishlists together.

## Features

- User authentication (signup/login)
- Create and manage wishlists
- Add, edit, and remove products from wishlists
- Invite others to collaborate on wishlists
- Real-time updates when changes are made
- See who added which items

## Tech Stack

- **Frontend**: React with Material-UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Real-time Updates**: Socket.io

## Project Structure

```
flockshop/
├── client/          # React frontend
├── server/          # Node.js/Express backend
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm start
   ```
2. Start the frontend development server:
   ```
   cd client
   npm start
   ```

## License

MIT
