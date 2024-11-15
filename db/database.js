const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'bot_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database');
});

// Initialize tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS managed_channels (
            guild_id TEXT,
            channel_id TEXT,
            PRIMARY KEY (guild_id, channel_id)
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_permissions (
            guild_id TEXT,
            user_id TEXT,
            channel_id TEXT,
            PRIMARY KEY (guild_id, user_id)
        )
    `);
});

// Database functions
const addChannel = (guildId, channelId) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO managed_channels (guild_id, channel_id) VALUES (?, ?)`,
            [guildId, channelId],
            (err) => err ? reject(err) : resolve()
        );
    });
};

const setUserChannel = (guildId, userId, channelId) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO user_permissions (guild_id, user_id, channel_id) VALUES (?, ?, ?)`,
            [guildId, userId, channelId],
            (err) => err ? reject(err) : resolve()
        );
    });
};

const getUserChannel = (guildId, userId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT channel_id FROM user_permissions WHERE guild_id = ? AND user_id = ?`,
            [guildId, userId],
            (err, row) => err ? reject(err) : resolve(row ? row.channel_id : null)
        );
    });
};

const isChannelManaged = (guildId, channelId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT channel_id FROM managed_channels WHERE guild_id = ? AND channel_id = ?`,
            [guildId, channelId],
            (err, row) => err ? reject(err) : resolve(!!row)
        );
    });
};

module.exports = { addChannel, setUserChannel, getUserChannel, isChannelManaged };
