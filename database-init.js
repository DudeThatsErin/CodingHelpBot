const connection = require('./database.js');

// Database table schemas
const schemas = {
    challenges: `
        CREATE TABLE IF NOT EXISTS Challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            player TEXT NOT NULL,
            points INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    challenge: `
        CREATE TABLE IF NOT EXISTS Challenge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            msgId TEXT,
            moderator TEXT,
            title TEXT,
            challengeNo INTEGER,
            channelD TEXT,
            leaderboardChannelId TEXT,
            prize1 TEXT,
            prize2 TEXT,
            prize3 TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    submissions: `
        CREATE TABLE IF NOT EXISTS Submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            msgId TEXT,
            author TEXT,
            message TEXT,
            file TEXT,
            challengeNo INTEGER,
            moderator TEXT DEFAULT '0',
            points INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    suggs: `
        CREATE TABLE IF NOT EXISTS Suggs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            noSugg TEXT,
            Author TEXT,
            Message TEXT,
            Avatar TEXT,
            stat TEXT,
            Moderator TEXT,
            LAST_EDITED DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    reports: `
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            messageId TEXT,
            authorId TEXT,
            message TEXT,
            avatar TEXT,
            status TEXT,
            moderator TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    thanks: `
        CREATE TABLE IF NOT EXISTS Thanks (
            rowNo INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            thanks INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    systems: `
        CREATE TABLE IF NOT EXISTS Systems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            system_name TEXT NOT NULL,
            enabled INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guildId, system_name)
        )
    `,
    afk: `
        CREATE TABLE IF NOT EXISTS AFK (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            guildId TEXT NOT NULL,
            channelId TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            expiresAt INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(userId, guildId)
        )
    `
};

// Initialize core tables (always needed)
async function initializeCoreTables() {
    try {
        await connection.run(schemas.suggs);
        await connection.run(schemas.reports);
        await connection.run(schemas.thanks);
        await connection.run(schemas.systems);
        await connection.run(schemas.afk);
        console.log('✅ Core database tables initialized');
    } catch (error) {
        console.error('❌ Error initializing core tables:', error);
    }
}

// Initialize challenge system tables
async function initializeChallengeTables() {
    try {
        await connection.run(schemas.challenges);
        await connection.run(schemas.challenge);
        await connection.run(schemas.submissions);
        console.log('✅ Challenge system tables initialized');
    } catch (error) {
        console.error('❌ Error initializing challenge tables:', error);
    }
}

// Check if a system is enabled for a guild
async function isSystemEnabled(guildId, systemName) {
    try {
        const result = await connection.get(
            `SELECT enabled FROM Systems WHERE guildId = ? AND system_name = ?`,
            [guildId, systemName]
        );
        return result ? result.enabled === 1 : false;
    } catch (error) {
        console.error('Error checking system status:', error);
        return false;
    }
}

// Enable a system for a guild
async function enableSystem(guildId, systemName) {
    try {
        await connection.run(
            `INSERT OR REPLACE INTO Systems (guildId, system_name, enabled) VALUES (?, ?, 1)`,
            [guildId, systemName]
        );
        
        // Initialize system-specific tables
        if (systemName === 'challenges') {
            await initializeChallengeTables();
        }
        
        console.log(`✅ System '${systemName}' enabled for guild ${guildId}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enabling system '${systemName}':`, error);
        return false;
    }
}

// Disable a system for a guild
async function disableSystem(guildId, systemName) {
    try {
        await connection.run(
            `INSERT OR REPLACE INTO Systems (guildId, system_name, enabled) VALUES (?, ?, 0)`,
            [guildId, systemName]
        );
        console.log(`✅ System '${systemName}' disabled for guild ${guildId}`);
        return true;
    } catch (error) {
        console.error(`❌ Error disabling system '${systemName}':`, error);
        return false;
    }
}

// Get challenge configuration for a guild
async function getChallengeConfig(guildId) {
    try {
        const result = await connection.get(
            `SELECT channelD, leaderboardChannelId, prize1, prize2, prize3 FROM Challenge WHERE guildId = ? LIMIT 1`,
            [guildId]
        );
        return result || null;
    } catch (error) {
        console.error('Error getting challenge config:', error);
        return null;
    }
}

// AFK Database Functions
async function setAFK(userId, guildId, channelId, message, timestamp, expiresAt = null) {
    try {
        await connection.run(
            `INSERT OR REPLACE INTO AFK (userId, guildId, channelId, message, timestamp, expiresAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, guildId, channelId, message, timestamp, expiresAt]
        );
        return true;
    } catch (error) {
        console.error('Error setting AFK in database:', error);
        return false;
    }
}

async function getAFK(userId, guildId) {
    try {
        const result = await connection.get(
            `SELECT * FROM AFK WHERE userId = ? AND guildId = ?`,
            [userId, guildId]
        );
        return result || null;
    } catch (error) {
        console.error('Error getting AFK from database:', error);
        return null;
    }
}

async function removeAFK(userId, guildId) {
    try {
        const result = await connection.run(
            `DELETE FROM AFK WHERE userId = ? AND guildId = ?`,
            [userId, guildId]
        );
        return result.changes > 0;
    } catch (error) {
        console.error('Error removing AFK from database:', error);
        return false;
    }
}

async function getAllActiveAFK() {
    try {
        const result = await connection.all(
            `SELECT * FROM AFK`
        );
        return result || [];
    } catch (error) {
        console.error('Error getting all AFK from database:', error);
        return [];
    }
}

async function getExpiredAFK() {
    try {
        const now = Date.now();
        const result = await connection.all(
            `SELECT * FROM AFK WHERE expiresAt IS NOT NULL AND expiresAt <= ?`,
            [now]
        );
        return result || [];
    } catch (error) {
        console.error('Error getting expired AFK from database:', error);
        return [];
    }
}

module.exports = {
    initializeCoreTables,
    initializeChallengeTables,
    isSystemEnabled,
    enableSystem,
    disableSystem,
    getChallengeConfig,
    setAFK,
    getAFK,
    removeAFK,
    getAllActiveAFK,
    getExpiredAFK
};
