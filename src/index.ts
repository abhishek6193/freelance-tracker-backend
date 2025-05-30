// Entry point for the freelance-tracker-backend
import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import taskRoutes from './routes/tasks';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Freelance Tracker API is running.');
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://abhishek6193:OBg5ug4oP8SlJhDg@cluster0.ifib4l4.mongodb.net/freelance-tracker?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  });
