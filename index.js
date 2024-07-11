const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const session = require("express-session");
const portConfig = require('../../portconfig.js').port;

// Routes
const apiRoutes = require('./routes/api');
const viewRoutes = require('./routes/views');

// Configuration
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Session management
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true,
}));

// Middleware to set user info for all routes
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? { id: req.session.userId } : null;
    next();
});

// Use routes
app.use('/hspr/api', apiRoutes);
app.use('/hspr', viewRoutes);

// Server setup
const PORT = process.env.PORT || portConfig;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
