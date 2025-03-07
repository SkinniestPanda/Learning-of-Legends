const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Create a new guild
router.post('/create', authenticateToken, (req, res) => {
    // Allow both students and admins to create guilds
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only students and administrators can create guilds" });
    }

    const { name, password, description } = req.body;
    const userId = req.user.userId;
    
    db.run('INSERT INTO guilds (name, password, description, leader_id) VALUES (?, ?, ?, ?)',
        [name, password, description, userId],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            // Add the leader as first member
            db.run('INSERT INTO guild_members (guild_id, user_id) VALUES (?, ?)',
                [this.lastID, userId],
                (err) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    res.json({ id: this.lastID, message: "Guild created successfully" });
                });
        });
});

// Join a guild
router.post('/join', authenticateToken, (req, res) => {
    const { guildId, password } = req.body;
    const userId = req.user.userId;

    // Add validation
    if (!guildId || isNaN(parseInt(guildId))) {
        return res.status(400).json({ error: "Invalid guild ID" });
    }

    console.log('Join request:', { guildId, userId });

    // First check if user is already in the guild
    db.get('SELECT * FROM guild_members WHERE guild_id = ? AND user_id = ?',
        [guildId, userId],
        (err, existingMember) => {
            if (err) {
                console.error('Error checking membership:', err);
                return res.status(400).json({ error: err.message });
            }
            if (existingMember) {
                return res.status(400).json({ error: "Already a member of this guild" });
            }

            // Then verify guild and password
            db.get('SELECT * FROM guilds WHERE id = ?',
                [guildId],
                (err, guild) => {
                    if (err) {
                        console.error('Error finding guild:', err);
                        return res.status(400).json({ error: err.message });
                    }

                    if (!guild) {
                        return res.status(404).json({ error: "Guild not found" });
                    }

                    if (guild.password !== password) {
                        return res.status(401).json({ error: "Invalid guild password" });
                    }

                    // Add user to guild
                    db.run('INSERT INTO guild_members (guild_id, user_id) VALUES (?, ?)',
                        [guildId, userId],
                        (err) => {
                            if (err) {
                                console.error('Error adding member:', err);
                                return res.status(400).json({ error: err.message });
                            }
                            res.json({ message: "Successfully joined guild" });
                        });
                });
        });
});

// Leave a guild
router.post('/leave', authenticateToken, (req, res) => {
    const { guildId } = req.body;
    const userId = req.user.userId;
    
    db.run('DELETE FROM guild_members WHERE guild_id = ? AND user_id = ?',
        [guildId, userId],
        (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: "Successfully left guild" });
        });
});

// Get all guilds
router.get('/all', authenticateToken, (req, res) => {
    db.all(`
        SELECT g.id, g.name, g.description, g.created_at, 
        u.username as leader_name,
        (SELECT COUNT(*) FROM guild_members WHERE guild_id = g.id) as member_count
        FROM guilds g
        JOIN users u ON g.leader_id = u.id
    `, [], (err, guilds) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ guilds });
    });
});

// Add a new route to get guild details including members
router.get('/details/:guildId', (req, res) => {
    const guildId = req.params.guildId;
    
    // First get guild info
    db.get('SELECT id, name, description, leader_id, created_at FROM guilds WHERE id = ?',
        [guildId],
        (err, guild) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!guild) {
                return res.status(404).json({ error: "Guild not found" });
            }
            
            // Then get all members
            db.all('SELECT user_id, join_date FROM guild_members WHERE guild_id = ?',
                [guildId],
                (err, members) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    res.json({ 
                        guild,
                        members
                    });
                });
        });
});

// Add this new route for deleting a guild
router.delete('/delete/:guildId', (req, res) => {
    const { guildId } = req.params;
    const { userId } = req.body;
    
    // First check if user is the guild leader
    db.get('SELECT leader_id FROM guilds WHERE id = ?', [guildId], (err, guild) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!guild) {
            return res.status(404).json({ error: "Guild not found" });
        }
        if (guild.leader_id !== userId) {
            return res.status(403).json({ error: "Only guild leader can delete the guild" });
        }

        // Delete guild members first (due to foreign key constraint)
        db.run('DELETE FROM guild_members WHERE guild_id = ?', [guildId], (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            // Then delete the guild
            db.run('DELETE FROM guilds WHERE id = ?', [guildId], (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json({ message: "Guild successfully deleted" });
            });
        });
    });
});

// Get guild members
router.get('/:guildId/members', authenticateToken, (req, res) => {
    const { guildId } = req.params;
    const userId = req.user.userId;

    // First check if user is a member of the guild
    db.get('SELECT * FROM guild_members WHERE guild_id = ? AND user_id = ?', 
        [guildId, userId], 
        (err, memberCheck) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!memberCheck) {
                return res.status(403).json({ error: "Not a member of this guild" });
            }

            // Get all members with their details
            db.all(`
                SELECT 
                    gm.user_id,
                    u.username,
                    gm.join_date,
                    g.leader_id = gm.user_id as is_leader
                FROM guild_members gm
                JOIN users u ON gm.user_id = u.id
                JOIN guilds g ON gm.guild_id = g.id
                WHERE gm.guild_id = ?
                ORDER BY is_leader DESC, gm.join_date ASC
            `, [guildId], (err, members) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json({ members });
            });
        }
    );
});

// Kick member (leader only)
router.post('/:guildId/kick', authenticateToken, (req, res) => {
    const { guildId } = req.params;
    const { userId: memberToKick } = req.body;
    const leaderId = req.user.userId;

    // Check if requester is guild leader
    db.get('SELECT * FROM guilds WHERE id = ? AND leader_id = ?', 
        [guildId, leaderId],
        (err, guild) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!guild) {
                return res.status(403).json({ error: "Not authorized to kick members" });
            }

            // Cannot kick the leader
            if (memberToKick === leaderId) {
                return res.status(400).json({ error: "Cannot kick the guild leader" });
            }

            // Remove member
            db.run('DELETE FROM guild_members WHERE guild_id = ? AND user_id = ?',
                [guildId, memberToKick],
                (err) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    res.json({ message: "Member kicked successfully" });
                });
        }
    );
});

// Add member by username
router.post('/:guildId/add-member', authenticateToken, (req, res) => {
    const { guildId } = req.params;
    const { username } = req.body;
    const leaderId = req.user.userId;

    // Check if requester is guild leader
    db.get('SELECT * FROM guilds WHERE id = ? AND leader_id = ?', 
        [guildId, leaderId],
        (err, guild) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!guild) {
                return res.status(403).json({ error: "Not authorized to add members" });
            }

            // Find user by username
            db.get('SELECT id FROM users WHERE username = ?', 
                [username],
                (err, user) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    if (!user) {
                        return res.status(404).json({ error: "User not found" });
                    }

                    // Check if already a member
                    db.get('SELECT * FROM guild_members WHERE guild_id = ? AND user_id = ?',
                        [guildId, user.id],
                        (err, existingMember) => {
                            if (err) {
                                return res.status(400).json({ error: err.message });
                            }
                            if (existingMember) {
                                return res.status(400).json({ error: "User is already a member" });
                            }

                            // Add new member
                            db.run('INSERT INTO guild_members (guild_id, user_id) VALUES (?, ?)',
                                [guildId, user.id],
                                (err) => {
                                    if (err) {
                                        return res.status(400).json({ error: err.message });
                                    }
                                    res.json({ message: "Member added successfully" });
                                });
                        });
                });
        }
    );
});

module.exports = router; 