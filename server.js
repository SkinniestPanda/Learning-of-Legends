const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
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

// PVP Game Logic
const pvpQueue = {
    '1v1': [],
    '3v3': []
};

const activeGames = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Handle player joining queue
    socket.on('joinQueue', (data) => {
        const mode = data.mode || '1v1';
        console.log(`Player ${socket.id} joined ${mode} queue`);
        
        // Remove player from any existing queues
        removePlayerFromQueues(socket.id);
        
        // Add player to the requested queue
        pvpQueue[mode].push(socket.id);
        
        // Check if we can match players
        matchPlayers(mode);
    });
    
    // Handle player leaving queue
    socket.on('leaveQueue', () => {
        console.log(`Player ${socket.id} left queue`);
        removePlayerFromQueues(socket.id);
    });
    
    // Handle answer submission
    socket.on('submitAnswer', (data) => {
        const game = activeGames[data.gameId];
        if (!game) return;
        
        const opponentId = game.players[0] === socket.id ? game.players[1] : game.players[0];
        const opponent = io.sockets.sockets.get(opponentId);
        
        // Notify opponent of the answer
        if (opponent) {
            opponent.emit('opponentAnswer', {
                correct: data.correct
            });
        }
        
        // If the answer was correct, send a new question
        if (data.correct) {
            sendQuestionToPlayers(game);
        }
    });
    
    // Handle time up event
    socket.on('timeUp', (data) => {
        const game = activeGames[data.gameId];
        if (!game) return;
        
        // When time is up, move to the next question
        sendQuestionToPlayers(game);
    });
    
    // Handle game over event
    socket.on('gameOver', (data) => {
        const gameIds = Object.keys(activeGames).filter(
            gameId => activeGames[gameId].players.includes(socket.id)
        );
        
        gameIds.forEach(gameId => {
            const game = activeGames[gameId];
            const opponentId = game.players[0] === socket.id ? game.players[1] : game.players[0];
            const opponent = io.sockets.sockets.get(opponentId);
            
            if (opponent) {
                opponent.emit('gameOver', {
                    winner: !data.winner
                });
            }
            
            // Clean up the game
            delete activeGames[gameId];
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove from queues
        removePlayerFromQueues(socket.id);
        
        // Notify opponents in active games
        const gameIds = Object.keys(activeGames).filter(
            gameId => activeGames[gameId].players.includes(socket.id)
        );
        
        gameIds.forEach(gameId => {
            const game = activeGames[gameId];
            const opponentId = game.players[0] === socket.id ? game.players[1] : game.players[0];
            const opponent = io.sockets.sockets.get(opponentId);
            
            if (opponent) {
                opponent.emit('opponentDisconnect');
            }
            
            // Clean up the game
            delete activeGames[gameId];
        });
    });
});

function removePlayerFromQueues(playerId) {
    Object.keys(pvpQueue).forEach(mode => {
        const index = pvpQueue[mode].indexOf(playerId);
        if (index !== -1) {
            pvpQueue[mode].splice(index, 1);
        }
    });
}

function matchPlayers(mode) {
    // Check if we have enough players to start a game
    const requiredPlayers = mode === '1v1' ? 2 : 6;
    
    if (pvpQueue[mode].length >= requiredPlayers) {
        // Get the players for the game
        const players = pvpQueue[mode].splice(0, requiredPlayers);
        
        // Create a new game
        const gameId = generateGameId();
        activeGames[gameId] = {
            id: gameId,
            mode: mode,
            players: players,
            questions: generateQuestions(),
            currentQuestionIndex: 0
        };
        
        // Notify all players that a match has been found
        players.forEach(playerId => {
            const playerSocket = io.sockets.sockets.get(playerId);
            if (playerSocket) {
                playerSocket.emit('matchFound', { gameId: gameId });
            }
        });
        
        // Send the first question
        sendQuestionToPlayers(activeGames[gameId]);
    }
}

function sendQuestionToPlayers(game) {
    // Get the next question
    const question = game.questions[game.currentQuestionIndex];
    
    // Increment the question index for next time
    game.currentQuestionIndex = (game.currentQuestionIndex + 1) % game.questions.length;
    
    // Send to all players
    game.players.forEach(playerId => {
        const playerSocket = io.sockets.sockets.get(playerId);
        if (playerSocket) {
            playerSocket.emit('questionUpdate', { question: question });
        }
    });
}

function generateGameId() {
    return Math.random().toString(36).substring(2, 10);
}

function generateQuestions() {
    // Load questions from files
    const questionFiles = [
        path.join(__dirname, 'public/questions/addition.js'),
        path.join(__dirname, 'public/questions/subtraction.js'),
        path.join(__dirname, 'public/questions/multiplication.js'),
        path.join(__dirname, 'public/questions/division.js')
    ];
    
    let allQuestions = [];
    
    questionFiles.forEach(file => {
        try {
            // Read file content
            const content = fs.readFileSync(file, 'utf8');
            
            // Extract the array from the file content
            const arrayMatch = content.match(/const \w+Questions\s*=\s*(\[[\s\S]*?\]);/);
            if (arrayMatch && arrayMatch[1]) {
                // Parse the array
                const questions = eval(arrayMatch[1]);
                allQuestions = allQuestions.concat(questions);
            }
        } catch (err) {
            console.error(`Error loading questions from ${file}:`, err);
        }
    });
    
    // Shuffle the questions
    shuffleArray(allQuestions);
    
    // Return a subset for the game
    return allQuestions.slice(0, 20);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Serve static files for all routes
app.get('*', (req, res, next) => {
    // Check if the requested path is an API route
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Check if the file exists
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }
    
    // Default to index.html for client-side routing
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 