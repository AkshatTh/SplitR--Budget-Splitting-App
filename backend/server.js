const dotenv = require('dotenv').config();
const express = require('express');
const PORT = 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const connectDB = require('./config/db');

connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the SplitR API' });
});


app.listen(PORT, () => console.log(`Server started on port ${PORT} \n http://localhost:${PORT}`));