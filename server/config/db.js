const mongoose = require("mongoose");

let connectionPromise = null;

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    const error = new Error("Database is not configured. Add MONGO_URI in Vercel or server/.env before creating accounts.");
    error.statusCode = 503;
    error.code = "DATABASE_NOT_CONFIGURED";
    throw error;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((connection) => {
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        error.statusCode = 503;
        throw error;
      });
  }

  return connectionPromise;
};

const getDatabaseHealth = () => ({
  configured: Boolean(process.env.MONGO_URI),
  readyState: mongoose.connection.readyState
});

module.exports = { connectDB, getDatabaseHealth };
