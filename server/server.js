const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Candidate form backend is running',
  });
});

app.use('/api/candidates', candidateRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
