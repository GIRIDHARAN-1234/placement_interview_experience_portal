const mongoose = require('mongoose');

const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (error.message && error.message.includes('querySrv')) {
      console.warn('[Database] Retrying MongoDB connection with public DNS resolvers (8.8.8.8, 1.1.1.1)...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(uri);
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (retryErr) {
        console.error(`[Database Error] Retry failed: ${retryErr.message}`);
      }
    }
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error(`[Troubleshooting] Verify MongoDB is running (e.g. netstat -ano | findstr :27017) or check your MONGODB_URI in backend/.env`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Warning] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected successfully.');
});

module.exports = connectDB;
