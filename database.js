const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create databases directory if it doesn't exist
const dbDir = path.join(__dirname, 'databases');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Database paths
const dbPaths = {
    bot: path.join(dbDir, 'bot.db'),
    challenges: path.join(dbDir, 'challenges.db'),
    suggestions: path.join(dbDir, 'suggestions.db'),
    reports: path.join(dbDir, 'reports.db'),
    thanks: path.join(dbDir, 'thanks.db')
};

// Database connections
const databases = {};

// Initialize bot database (always available)
databases.bot = new sqlite3.Database(dbPaths.bot, (err) => {
    if (err) {
        console.error('Error opening bot database:', err.message);
    } else {
        console.log('Connected to the bot SQLite database');
        // Initialize reaction roles table
        databases.bot.run(`
            CREATE TABLE IF NOT EXISTS reaction_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                message_id TEXT NOT NULL,
                emoji TEXT NOT NULL,
                role_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(message_id, emoji)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating reaction_roles table:', err.message);
            } else {
                console.log('Reaction roles table ready');
            }
        });
        
        // Create system status table
        databases.bot.run(`
            CREATE TABLE IF NOT EXISTS system_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                system_name TEXT NOT NULL,
                enabled INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, system_name)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating system_status table:', err.message);
            } else {
                console.log('System status table ready');
            }
        });

        // Create system configurations table
        databases.bot.run(`
            CREATE TABLE IF NOT EXISTS system_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                system_name TEXT NOT NULL,
                config_key TEXT NOT NULL,
                config_value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, system_name, config_key)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating system_configs table:', err.message);
            } else {
                console.log('System configs table ready');
            }
        });
    }
});

// System management functions
const systemManager = {
    // Check if a system is enabled for a guild
    isSystemEnabled: async (guildId, systemName) => {
        try {
            const result = await botDbAsync.get(
                'SELECT enabled FROM system_status WHERE guild_id = ? AND system_name = ?',
                [guildId, systemName]
            );
            return result ? result.enabled === 1 : false;
        } catch (error) {
            console.error(`Error checking system status for ${systemName}:`, error);
            return false;
        }
    },
    
    // Enable a system for a guild
    enableSystem: async (guildId, systemName) => {
        try {
            // Create the database if it doesn't exist
            if (!databases[systemName]) {
                await createSystemDatabase(systemName);
            }
            
            await botDbAsync.run(
                'INSERT OR REPLACE INTO system_status (guild_id, system_name, enabled, updated_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
                [guildId, systemName]
            );
            return { success: true };
        } catch (error) {
            console.error(`Error enabling system ${systemName}:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // Disable a system for a guild
    disableSystem: async (guildId, systemName) => {
        try {
            await botDbAsync.run(
                'INSERT OR REPLACE INTO system_status (guild_id, system_name, enabled, updated_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP)',
                [guildId, systemName]
            );
            return { success: true };
        } catch (error) {
            console.error(`Error disabling system ${systemName}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Set system configuration
    setSystemConfig: async (guildId, systemName, configKey, configValue) => {
        try {
            await botDbAsync.run(
                'INSERT OR REPLACE INTO system_configs (guild_id, system_name, config_key, config_value, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [guildId, systemName, configKey, configValue]
            );
            return { success: true };
        } catch (error) {
            console.error(`Error setting system config for ${systemName}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Get system configuration
    getSystemConfig: async (guildId, systemName, configKey) => {
        try {
            const result = await botDbAsync.get(
                'SELECT config_value FROM system_configs WHERE guild_id = ? AND system_name = ? AND config_key = ?',
                [guildId, systemName, configKey]
            );
            return result ? result.config_value : null;
        } catch (error) {
            console.error(`Error getting system config for ${systemName}:`, error);
            return null;
        }
    },

    // Get all system configurations for a system
    getAllSystemConfigs: async (guildId, systemName) => {
        try {
            const results = await botDbAsync.all(
                'SELECT config_key, config_value FROM system_configs WHERE guild_id = ? AND system_name = ?',
                [guildId, systemName]
            );
            const configs = {};
            results.forEach(row => {
                configs[row.config_key] = row.config_value;
            });
            return configs;
        } catch (error) {
            console.error(`Error getting all system configs for ${systemName}:`, error);
            return {};
        }
    }
};

// Create system database function
const createSystemDatabase = (systemName) => {
    return new Promise((resolve, reject) => {
        if (databases[systemName]) {
            resolve();
            return;
        }
        
        databases[systemName] = new sqlite3.Database(dbPaths[systemName], (err) => {
            if (err) {
                console.error(`Error creating ${systemName} database:`, err.message);
                reject(err);
                return;
            }
            
            console.log(`Connected to the ${systemName} SQLite database`);
            
            // Initialize tables based on system type
            let initQueries = [];
            
            switch (systemName) {
                case 'challenges':
                    initQueries = [
                        `CREATE TABLE IF NOT EXISTS Challenge (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            guildId TEXT NOT NULL,
                            msgId TEXT,
                            channelD TEXT,
                            moderator TEXT,
                            title TEXT,
                            challengeNo INTEGER,
                            prize1 TEXT,
                            prize2 TEXT,
                            prize3 TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS Challenges (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            guildId TEXT NOT NULL,
                            player TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS Submissions (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            guildId TEXT NOT NULL,
                            msgId TEXT,
                            author TEXT,
                            message TEXT,
                            file TEXT,
                            challengeNo INTEGER,
                            moderator TEXT,
                            points INTEGER DEFAULT 0,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`
                    ];
                    break;
                case 'suggestions':
                    initQueries = [
                        `CREATE TABLE IF NOT EXISTS Suggs (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            noSugg TEXT,
                            Author TEXT,
                            Message TEXT,
                            Avatar TEXT,
                            stat TEXT,
                            Moderator TEXT DEFAULT 'New Suggestion, No Mod.',
                            LAST_EDITED DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`
                    ];
                    break;
                case 'reports':
                    initQueries = [
                        `CREATE TABLE IF NOT EXISTS reports (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            messageId TEXT,
                            authorId TEXT,
                            avatar TEXT,
                            description TEXT,
                            file TEXT,
                            stat TEXT DEFAULT 'New Report',
                            moderator TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`
                    ];
                    break;
                case 'thanks':
                    initQueries = [
                        `CREATE TABLE IF NOT EXISTS Thanks (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            userId TEXT,
                            user TEXT,
                            thanks INTEGER DEFAULT 1,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`
                    ];
                    break;
            }
            
            // Execute all initialization queries
            let completed = 0;
            const total = initQueries.length;
            
            if (total === 0) {
                resolve();
                return;
            }
            
            initQueries.forEach((query) => {
                databases[systemName].run(query, (err) => {
                    if (err) {
                        console.error(`Error creating table in ${systemName} database:`, err.message);
                        reject(err);
                        return;
                    }
                    completed++;
                    if (completed === total) {
                        console.log(`${systemName} database tables initialized`);
                        resolve();
                    }
                });
            });
        });
    });
};

// Promisify database methods for bot database
const botDbAsync = {
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            databases.bot.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            databases.bot.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            databases.bot.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
};

// Create async methods for system databases
const createDbAsync = (dbName) => {
    return {
        get: (sql, params = []) => {
            return new Promise((resolve, reject) => {
                if (!databases[dbName]) {
                    reject(new Error(`Database ${dbName} not initialized`));
                    return;
                }
                databases[dbName].get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        },
        all: (sql, params = []) => {
            return new Promise((resolve, reject) => {
                if (!databases[dbName]) {
                    reject(new Error(`Database ${dbName} not initialized`));
                    return;
                }
                databases[dbName].all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        },
        run: (sql, params = []) => {
            return new Promise((resolve, reject) => {
                if (!databases[dbName]) {
                    reject(new Error(`Database ${dbName} not initialized`));
                    return;
                }
                databases[dbName].run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                });
            });
        }
    };
};

// System database async objects
const challengesDb = createDbAsync('challenges');
const suggestionsDb = createDbAsync('suggestions');
const reportsDb = createDbAsync('reports');
const thanksDb = createDbAsync('thanks');

// Legacy connection object for backward compatibility (uses bot database)
const dbAsync = botDbAsync;

// Reaction role specific functions
const reactionRoles = {
    add: async (guildId, channelId, messageId, emoji, roleId) => {
        try {
            const result = await dbAsync.run(
                'INSERT INTO reaction_roles (guild_id, channel_id, message_id, emoji, role_id) VALUES (?, ?, ?, ?, ?)',
                [guildId, channelId, messageId, emoji, roleId]
            );
            return { success: true, id: result.id };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return { success: false, error: 'Reaction role already exists for this message and emoji' };
            }
            return { success: false, error: error.message };
        }
    },
    
    remove: async (messageId, emoji = null) => {
        try {
            let sql = 'DELETE FROM reaction_roles WHERE message_id = ?';
            let params = [messageId];
            
            if (emoji) {
                sql += ' AND emoji = ?';
                params.push(emoji);
            }
            
            const result = await dbAsync.run(sql, params);
            return { success: true, changes: result.changes };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    get: async (messageId, emoji) => {
        try {
            const row = await dbAsync.get(
                'SELECT * FROM reaction_roles WHERE message_id = ? AND emoji = ?',
                [messageId, emoji]
            );
            return row;
        } catch (error) {
            console.error('Error getting reaction role:', error);
            return null;
        }
    },
    
    getAll: async (guildId = null) => {
        try {
            let sql = 'SELECT * FROM reaction_roles';
            let params = [];
            
            if (guildId) {
                sql += ' WHERE guild_id = ?';
                params.push(guildId);
            }
            
            const rows = await dbAsync.all(sql, params);
            return rows;
        } catch (error) {
            console.error('Error getting all reaction roles:', error);
            return [];
        }
    }
};

module.exports = { 
    ...dbAsync, 
    reactionRoles,
    systemManager,
    challengesDb,
    suggestionsDb,
    reportsDb,
    thanksDb,
    botDb: botDbAsync
};