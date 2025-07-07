# FlockShop Client

This is the frontend React application for the FlockShop collaborative wishlist app.

## Environment Variables Setup

### Firebase Configuration

For security reasons, Firebase configuration values should be stored in environment variables rather than hardcoded in the source code. Follow these steps to set up your environment:

1. Create a `.env` file in the root of the client directory
2. Add the following environment variables with your Firebase project values:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

**Note**: In React applications, all environment variables must start with `REACT_APP_` prefix to be properly injected.

### Local Development

The `.env` file should never be committed to version control. It's already added to `.gitignore`.

### Production Deployment

When deploying to production platforms like Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each of your Firebase environment variables:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   ...
   ```
3. Vercel will inject them during the build process

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables as described above

3. Start the development server:
   ```
   npm start
   ```

## Authentication

This application uses Firebase Authentication. The authentication flow is handled through the Firebase SDK and integrated with the backend using JWT tokens.
