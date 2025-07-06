import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { handleInviteRedirect } from './utils/inviteHandler';

// Check if there's an invite code in the URL query parameters
// If there is, redirect to the join page with the code in the URL path
// This allows handling invite links like http://localhost:3000?code=ABC123
const redirected = handleInviteRedirect();

// Only render the app if we're not redirecting
if (!redirected) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
