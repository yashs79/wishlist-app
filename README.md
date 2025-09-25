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
4. Set up environment variables:
   - For the server, create a `.env` file in the `server` directory (see `server/README.md` for details)
   - For the client, create a `.env` file in the `client` directory with your Firebase configuration

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
graph TD
    subgraph A[Presentation Layer]
        UI[Conversational UI / Chatbot]
    end

    subgraph B[Application Layer - Core Logic]
        NLP[NLP Engine]
        SearchRec[Search & Recommendation Engine]
    end

    subgraph C[AI / Machine Learning Layer]
        PriceModel[Price Prediction Model <br/><i>(LSTM, Boosting, etc.)</i>]
        PersonalizationModel[Personalization Model <br/><i>(Collaborative Filtering, etc.)</i>]
    end

    subgraph D[Data Layer]
        Aggregator[Data Aggregator]
        UserDB[(User Profile Database)]
        FlightDW[(Flight Data Warehouse)]
    end

    subgraph E[External Sources]
        APIs[External Airline APIs / GDS]
    end

    %% --- Connections & Data Flow ---
    User[User] --> UI
    UI --> NLP
    NLP --> SearchRec
    SearchRec --> Aggregator
    SearchRec --> PriceModel
    SearchRec --> PersonalizationModel
    PersonalizationModel --> UserDB
    PriceModel --> FlightDW
    Aggregator --> APIs
    Aggregator --> FlightDW
    SearchRec --> UI
