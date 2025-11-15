import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expense.js';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Walleto API is running 🚀');
});

mongoose
  .connect(process.env.APP_MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

export default app;
