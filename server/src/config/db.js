import mongoose from "mongoose";

let memoryServer;

async function connectToMongo(uri) {
  const connection = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}

async function connectMemoryMongo(reason) {
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  process.env.BAYANIHAN_MEMORY_DB = "true";
  const uri = memoryServer.getUri("bayanihanhub");
  const connection = await mongoose.connect(uri);
  console.log(`MongoDB memory server connected for local development (${reason}).`);
  return connection;
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  const isProduction = process.env.NODE_ENV === "production";

  if (!mongoUri) {
    if (!isProduction) {
      return connectMemoryMongo("MONGO_URI is missing");
    }
    throw new Error("MONGO_URI is missing in the environment variables.");
  }

  try {
    return await connectToMongo(mongoUri);
  } catch (error) {
    const isLocalUri = mongoUri.includes("127.0.0.1") || mongoUri.includes("localhost");
    if (!isProduction && isLocalUri) {
      console.warn(`Local MongoDB unavailable: ${error.message}`);
      return connectMemoryMongo("local MongoDB is unavailable");
    }
    throw error;
  }
}
