import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../src/routes/auth';
import expenseRoutes from '../src/routes/expense';
import serverless from 'serverless-http';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Walleto API is running 🚀 (Serverless)');
});

// MongoDB connection (only run once)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.APP_MONGO_URI!);
}

export default serverless(app);
