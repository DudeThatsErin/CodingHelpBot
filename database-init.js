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
            Name TEXT,
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
    `,
    modmail: `
        CREATE TABLE IF NOT EXISTS ModMail (
            userId TEXT NOT NULL,
            channelId TEXT NOT NULL,
            guildId TEXT NOT NULL,
            open INTEGER DEFAULT 1,
            openedAt INTEGER NOT NULL,
            lastUpdate INTEGER NOT NULL,
            closedAt INTEGER,
            closeRequestedAt INTEGER,
            transcript TEXT,
            PRIMARY KEY (userId, channelId)
        )
    `,
    warns: `
        CREATE TABLE IF NOT EXISTS Warns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            guildId TEXT NOT NULL,
            moderatorId TEXT NOT NULL,
            reason TEXT,
            timestamp INTEGER NOT NULL
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
        await connection.run(schemas.warns);
        await migrateModMail();
        await migrateSuggs();
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

// ModMail Database Functions

// Migrate the ModMail table to the historical schema (composite PK + timestamps + transcript)
async function migrateModMail() {
    try {
        const cols = await connection.all(`PRAGMA table_info(ModMail)`);

        // Table does not exist yet, create it fresh
        if (cols.length === 0) {
            await connection.run(schemas.modmail);
            return;
        }

        const colNames = cols.map(c => c.name);
        const pkCols = cols.filter(c => c.pk > 0).map(c => c.name);
        const hasNewColumns = colNames.includes('transcript') && colNames.includes('openedAt') && colNames.includes('lastUpdate') && colNames.includes('closedAt');
        const hasCompositePk = pkCols.includes('userId') && pkCols.includes('channelId');

        if (!(hasNewColumns && hasCompositePk)) {
            // Rebuild the table while preserving any existing rows
            const now = Date.now();
            const oldRows = await connection.all(`SELECT * FROM ModMail`);

            await connection.run(`ALTER TABLE ModMail RENAME TO ModMail_old`);
            await connection.run(schemas.modmail);

            for (const r of oldRows) {
                const open = r.open != null ? r.open : 1;
                await connection.run(
                    `INSERT OR IGNORE INTO ModMail (userId, channelId, guildId, open, openedAt, lastUpdate, closedAt, closeRequestedAt, transcript) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        r.userId,
                        r.channelId,
                        r.guildId,
                        open,
                        r.openedAt || now,
                        r.lastUpdate || now,
                        r.closedAt || (open === 0 ? now : null),
                        r.closeRequestedAt || null,
                        r.transcript || null
                    ]
                );
            }

            await connection.run(`DROP TABLE ModMail_old`);
            console.log('✅ ModMail table migrated to historical schema');
        }

        // Ensure the closeRequestedAt column exists for tables already on the composite schema
        try {
            await connection.run(`ALTER TABLE ModMail ADD COLUMN closeRequestedAt INTEGER`);
        } catch (e) {
            // Column already exists - ignore
        }
    } catch (error) {
        console.error('Error migrating ModMail table:', error);
    }
}

// Ensure the Suggs table has the Name column (added after the original schema).
async function migrateSuggs() {
    try {
        await connection.run(`ALTER TABLE Suggs ADD COLUMN Name TEXT`);
    } catch (e) {
        // Column already exists - ignore
    }
}

async function createModMailTicket(userId, channelId, guildId) {
    try {
        const now = Date.now();
        await connection.run(
            `INSERT INTO ModMail (userId, channelId, guildId, open, openedAt, lastUpdate) VALUES (?, ?, ?, 1, ?, ?)`,
            [userId, channelId, guildId, now, now]
        );
        return true;
    } catch (error) {
        console.error('Error creating ModMail ticket:', error);
        return false;
    }
}

async function getOpenTicketByUser(userId) {
    try {
        const result = await connection.get(
            `SELECT * FROM ModMail WHERE userId = ? AND open = 1 ORDER BY openedAt DESC LIMIT 1`,
            [userId]
        );
        return result || null;
    } catch (error) {
        console.error('Error getting open ModMail ticket by user:', error);
        return null;
    }
}

async function getTicketByChannel(channelId) {
    try {
        const result = await connection.get(
            `SELECT * FROM ModMail WHERE channelId = ? AND open = 1`,
            [channelId]
        );
        return result || null;
    } catch (error) {
        console.error('Error getting ModMail ticket by channel:', error);
        return null;
    }
}

// Update the lastUpdate timestamp for an open ticket (called on any activity)
async function touchModMailTicket(channelId) {
    try {
        await connection.run(
            `UPDATE ModMail SET lastUpdate = ? WHERE channelId = ? AND open = 1`,
            [Date.now(), channelId]
        );
        return true;
    } catch (error) {
        console.error('Error touching ModMail ticket:', error);
        return false;
    }
}

// Set (or clear) the pending close-request timestamp for an open ticket
async function setCloseRequested(channelId, timestamp) {
    try {
        await connection.run(
            `UPDATE ModMail SET closeRequestedAt = ? WHERE channelId = ? AND open = 1`,
            [timestamp, channelId]
        );
        return true;
    } catch (error) {
        console.error('Error setting ModMail close request:', error);
        return false;
    }
}

// Get every currently open ticket (used by the auto-close checker)
async function getAllOpenTickets() {
    try {
        const result = await connection.all(`SELECT * FROM ModMail WHERE open = 1`);
        return result || [];
    } catch (error) {
        console.error('Error getting open ModMail tickets:', error);
        return [];
    }
}

async function closeModMailTicket(channelId, transcript = null) {
    try {
        const now = Date.now();
        const result = await connection.run(
            `UPDATE ModMail SET open = 0, closedAt = ?, lastUpdate = ?, transcript = ? WHERE channelId = ?`,
            [now, now, transcript, channelId]
        );
        return result.changes > 0;
    } catch (error) {
        console.error('Error closing ModMail ticket:', error);
        return false;
    }
}

// Get every ticket a user has ever opened (historical record)
async function getUserTicketHistory(userId) {
    try {
        const result = await connection.all(
            `SELECT * FROM ModMail WHERE userId = ? ORDER BY openedAt DESC`,
            [userId]
        );
        return result || [];
    } catch (error) {
        console.error('Error getting ModMail ticket history:', error);
        return [];
    }
}

// Warnings (moderation) Database Functions

// Add a warning and return its new id (or null on failure)
async function addWarn(userId, guildId, moderatorId, reason) {
    try {
        const result = await connection.run(
            `INSERT INTO Warns (userId, guildId, moderatorId, reason, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [userId, guildId, moderatorId, reason || null, Date.now()]
        );
        return result.id;
    } catch (error) {
        console.error('Error adding warn:', error);
        return null;
    }
}

// Get all warnings for a user in a guild (newest first)
async function getWarns(userId, guildId) {
    try {
        const result = await connection.all(
            `SELECT * FROM Warns WHERE userId = ? AND guildId = ? ORDER BY timestamp DESC`,
            [userId, guildId]
        );
        return result || [];
    } catch (error) {
        console.error('Error getting warns:', error);
        return [];
    }
}

// Count the warnings a user has in a guild
async function getWarnCount(userId, guildId) {
    try {
        const result = await connection.get(
            `SELECT COUNT(*) AS count FROM Warns WHERE userId = ? AND guildId = ?`,
            [userId, guildId]
        );
        return result ? result.count : 0;
    } catch (error) {
        console.error('Error counting warns:', error);
        return 0;
    }
}

// Delete a single warning by id (scoped to a guild). Returns true if a row was removed.
async function deleteWarn(id, guildId) {
    try {
        const result = await connection.run(
            `DELETE FROM Warns WHERE id = ? AND guildId = ?`,
            [id, guildId]
        );
        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting warn:', error);
        return false;
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
    getExpiredAFK,
    createModMailTicket,
    getOpenTicketByUser,
    getTicketByChannel,
    touchModMailTicket,
    setCloseRequested,
    getAllOpenTickets,
    closeModMailTicket,
    getUserTicketHistory,
    addWarn,
    getWarns,
    getWarnCount,
    deleteWarn
};
