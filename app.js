const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes/hspr'); // Adjust the path as necessary

const app = express();

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/hspr', routes);

// Route for serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
