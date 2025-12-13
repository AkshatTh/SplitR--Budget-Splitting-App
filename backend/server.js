const dotenv = require('dotenv').config();
const express = require('express');
const PORT = 5000;
const connectDB = require('./config/db');
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the SplitR API' });
});


app.listen(PORT, () => console.log(`Server started on port ${PORT} \n http://localhost:${PORT}`));