/**
 * Server configuration file
 * This file provides fallback values for environment variables
 */

const PORT = process.env.PORT || 5001; // Using port 5001 to match client proxy configuration

module.exports = {
  PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
