import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import collectionRoutes from './routes/collectionRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Utiliser les routes
app.use('/api', collectionRoutes);
app.use('/api', cardRoutes);
app.use('/api', userRoutes);

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});