const { setAFK, getAFK, removeAFK, getAllActiveAFK, getExpiredAFK } = require('./database-init.js');

class AFKManager {
    constructor(client) {
        this.client = client;
        this.activeTimers = new Map(); // Store timeout IDs
    }

    // Initialize AFK system on bot startup
    async initialize() {
        console.log('🔄 Initializing AFK system...');
        
        // Clean up expired AFK entries first
        await this.cleanupExpiredAFK();
        
        // Restore active AFK timers
        await this.restoreActiveTimers();
        
        console.log('✅ AFK system initialized');
    }

    // Set user as AFK
    async setUserAFK(userId, guildId, channelId, message, durationMs = null) {
        const timestamp = Date.now();
        const expiresAt = durationMs ? timestamp + durationMs : null;
        
        // Save to database
        const success = await setAFK(userId, guildId, channelId, message, timestamp, expiresAt);
        if (!success) {
            throw new Error('Failed to save AFK to database');
        }

        // Set timer if duration specified
        if (durationMs) {
            this.setExpiryTimer(userId, guildId, channelId, durationMs);
        }

        return { timestamp, expiresAt };
    }

    // Remove user from AFK
    async removeUserAFK(userId, guildId) {
        // Remove from database
        const success = await removeAFK(userId, guildId);
        
        // Clear any active timer
        const timerKey = `${userId}-${guildId}`;
        if (this.activeTimers.has(timerKey)) {
            clearTimeout(this.activeTimers.get(timerKey));
            this.activeTimers.delete(timerKey);
        }

        return success;
    }

    // Get user's AFK status
    async getUserAFK(userId, guildId) {
        return await getAFK(userId, guildId);
    }

    // Check if user is AFK
    async isUserAFK(userId, guildId) {
        const afkData = await getAFK(userId, guildId);
        return afkData !== null;
    }

    // Set expiry timer for AFK
    setExpiryTimer(userId, guildId, channelId, durationMs) {
        const timerKey = `${userId}-${guildId}`;
        
        // Clear existing timer if any
        if (this.activeTimers.has(timerKey)) {
            clearTimeout(this.activeTimers.get(timerKey));
        }

        // Set new timer
        const timerId = setTimeout(async () => {
            await this.handleAFKExpiry(userId, guildId, channelId);
            this.activeTimers.delete(timerKey);
        }, durationMs);

        this.activeTimers.set(timerKey, timerId);
    }

    // Handle AFK expiry
    async handleAFKExpiry(userId, guildId, channelId) {
        try {
            // Remove from database
            await this.removeUserAFK(userId, guildId);

            // Remove (AFK) from nickname
            try {
                const guild = await this.client.guilds.fetch(guildId);
                const member = await guild.members.fetch(userId);
                const currentNick = member.displayName;
                
                if (currentNick.endsWith(' (AFK)')) {
                    const newNick = currentNick.replace(' (AFK)', '');
                    await member.setNickname(newNick === member.user.username ? null : newNick);
                }
            } catch (error) {
                if (error.code === 50013) {
                    console.log(`Cannot update nickname after AFK expiry: Missing permissions (role hierarchy)`);
                } else {
                    console.error('Error updating nickname after AFK expiry:', error);
                }
            }

            // Send expiry notification
            try {
                const channel = await this.client.channels.fetch(channelId);
                const notificationMessage = await channel.send(`<@${userId}> Your AFK period has ended!`);
                
                // Delete notification after 1 minute
                setTimeout(() => {
                    notificationMessage.delete().catch(() => {});
                }, 60000);
            } catch (error) {
                console.error('Error sending AFK expiry notification:', error);
            }
        } catch (error) {
            console.error('Error handling AFK expiry:', error);
        }
    }

    // Clean up expired AFK entries
    async cleanupExpiredAFK() {
        try {
            const expiredEntries = await getExpiredAFK();
            
            for (const entry of expiredEntries) {
                await this.handleAFKExpiry(entry.userId, entry.guildId, entry.channelId);
            }
            
            if (expiredEntries.length > 0) {
                console.log(`🧹 Cleaned up ${expiredEntries.length} expired AFK entries`);
            }
        } catch (error) {
            console.error('Error cleaning up expired AFK:', error);
        }
    }

    // Restore active timers on bot startup
    async restoreActiveTimers() {
        try {
            const activeAFK = await getAllActiveAFK();
            let restoredCount = 0;
            
            for (const entry of activeAFK) {
                if (entry.expiresAt) {
                    const remainingTime = entry.expiresAt - Date.now();
                    
                    if (remainingTime > 0) {
                        // Restore timer with remaining time
                        this.setExpiryTimer(entry.userId, entry.guildId, entry.channelId, remainingTime);
                        restoredCount++;
                    } else {
                        // Already expired, handle immediately
                        await this.handleAFKExpiry(entry.userId, entry.guildId, entry.channelId);
                    }
                }
            }
            
            if (restoredCount > 0) {
                console.log(`⏰ Restored ${restoredCount} AFK timers`);
            }
        } catch (error) {
            console.error('Error restoring AFK timers:', error);
        }
    }

    // Get all AFK users for mentions
    async getAllAFKUsers() {
        return await getAllActiveAFK();
    }
}

module.exports = AFKManager;
