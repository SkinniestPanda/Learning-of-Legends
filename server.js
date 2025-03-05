const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

//jy
const attemptsRouter = require('./routes/attempts');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Update the CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Routes
const guildRouter = require('./routes/guild');
const authRouter = require('./routes/auth');

app.use('/api/guild', guildRouter);
app.use('/api/auth', authRouter);

//JY
// Use the attempts API routes
app.use('/api/attempts', attemptsRouter);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);

}); 