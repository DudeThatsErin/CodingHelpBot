const { EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { COLORS } = require('./logging/logger.js');
const {
    createModMailTicket,
    getOpenTicketByUser,
    getTicketByChannel,
    touchModMailTicket,
    setCloseRequested,
    getAllOpenTickets,
    closeModMailTicket
} = require('./database-init.js');

// ModMail configuration
const GUILD_ID = '359760149683896320';        // r/CodingHelp server
const MODMAIL_CATEGORY = '990720040296919130'; // ModMail category
const MODMAIL_LOG = '990720041651687514';      // ModMail log channel
const MOD_ROLE = '780941276602302523';         // Moderator role (only role that can see/use tickets)
const MOD_TEAM_NAME = 'r/CodingHelp Mod Team';
const CLOSE_REMINDER = 'You can type `/close` at any time to close this ticket.';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SIXTY_MINUTES_MS = 60 * 60 * 1000;

// Transcripts are written to the portfolio's public folder (served at the web root) with an
// unguessable filename so they are reachable by URL but not discoverable from the site itself.
const TRANSCRIPT_DIR = '/var/www/erinskidds.com/public/codinghelp/files';
const TRANSCRIPT_BASE_URL = 'https://erinskidds.com/codinghelp/files';

// Dates are stored in the DB as UTC epoch milliseconds and formatted here for display.
function formatDate(ts) {
    if (!ts) return 'Unknown';
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-US', { timeZone: 'UTC' })}, ${d.toLocaleTimeString('en-US', { timeZone: 'UTC' })} UTC`;
}

class ModMailManager {
    constructor(client) {
        this.client = client;
    }

    // Send an event embed (and optional files) to the ModMail log channel
    async logEvent(embed, files = []) {
        try {
            const logChannel = await this.client.channels.fetch(MODMAIL_LOG);
            if (logChannel) {
                await logChannel.send({ embeds: [embed], files });
            }
        } catch (error) {
            console.error('ModMail logEvent error:', error);
        }
    }

    // Update a ticket's lastUpdate timestamp on any activity
    async touchTicket(channelId) {
        return touchModMailTicket(channelId);
    }

    // Handle a DM sent to the bot by a user
    async handleUserDM(message) {
        try {
            // Allow the user to close their own ticket from DMs
            if (message.content && message.content.trim().toLowerCase() === '/close') {
                await this.requestCloseFromUser(message);
                return;
            }

            const guild = await this.client.guilds.fetch(GUILD_ID);

            // Make sure the user is actually a member of the server
            let member;
            try {
                member = await guild.members.fetch(message.author.id);
            } catch (error) {
                await message.reply('You must be a member of the **r/CodingHelp** server to contact the moderators.').catch(() => {});
                return;
            }

            // Find an existing open ticket or create a new one
            let ticket = await getOpenTicketByUser(message.author.id);
            let channel = null;

            if (ticket) {
                channel = await guild.channels.fetch(ticket.channelId).catch(() => null);
                if (!channel) {
                    // Channel was deleted manually, close the stale ticket
                    await closeModMailTicket(ticket.channelId);
                    ticket = null;
                }
            }

            if (!ticket) {
                channel = await this.createTicketChannel(guild, message.author);
                await createModMailTicket(message.author.id, channel.id, guild.id);

                const openEmbed = new EmbedBuilder()
                    .setColor(COLORS.blurple)
                    .setTitle('📬 New ModMail Ticket')
                    .setThumbnail(message.author.displayAvatarURL())
                    .setDescription(`A new ticket has been opened by <@${message.author.id}>.`)
                    .addFields(
                        { name: 'User', value: `${message.author.tag} (\`${message.author.id}\`)`, inline: false },
                        { name: 'How to respond', value: 'Use `/reply <message>` to message the user. Anything you type normally in this channel is an internal note the user **cannot** see.', inline: false }
                    )
                    .setTimestamp();

                await channel.send({ content: `<@&${MOD_ROLE}>`, embeds: [openEmbed] });

                await message.reply(`📬 Your message has been delivered to the **r/CodingHelp Mod Team**. They will reply here as soon as possible. Keep messaging me to add to your ticket.\n\n${CLOSE_REMINDER}`).catch(() => {});

                const logOpen = new EmbedBuilder()
                    .setColor(COLORS.green)
                    .setTitle('New Ticket')
                    .setDescription(`A ticket was opened in <#${channel.id}>.`)
                    .setFooter({ text: `${message.author.tag} | ${message.author.id}`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp();
                await this.logEvent(logOpen);
            }

            // Relay the user's message into the ticket channel
            const relayEmbed = new EmbedBuilder()
                .setColor(COLORS.blurple)
                .setAuthor({ name: `${message.author.tag} (${message.author.id})`, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content || '*No text content*')
                .setFooter({ text: 'User → Mods' })
                .setTimestamp();

            const files = [...message.attachments.values()].map(a => a.url);

            await channel.send({ embeds: [relayEmbed], files });
            await message.react('📨').catch(() => {});

            await touchModMailTicket(channel.id);
        } catch (error) {
            console.error('ModMail handleUserDM error:', error);
            await message.reply('Sorry, something went wrong while sending your message to the moderators. Please try again later.').catch(() => {});
        }
    }

    // Create a private ticket channel under the ModMail category
    async createTicketChannel(guild, user) {
        const safeName = (user.username || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 90) || 'user';

        return guild.channels.create({
            name: `modmail-${safeName}`,
            type: ChannelType.GuildText,
            parent: MODMAIL_CATEGORY,
            topic: `ModMail ticket for ${user.tag} (${user.id})`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: MOD_ROLE,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                }
            ]
        });
    }

    // Send a moderator reply (via /reply) to the user as a DM
    async sendReply(interaction, content, attachment, anonymous) {
        const ticket = await getTicketByChannel(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This channel is not an active ModMail ticket.', flags: MessageFlags.Ephemeral });
        }

        const user = await this.client.users.fetch(ticket.userId).catch(() => null);
        if (!user) {
            return interaction.reply({ content: '❌ I could not find the user for this ticket. They may have deleted their account.', flags: MessageFlags.Ephemeral });
        }

        const authorName = anonymous ? MOD_TEAM_NAME : `${MOD_TEAM_NAME} • ${interaction.member.displayName}`;
        const files = attachment ? [attachment.url] : [];

        const dmEmbed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setAuthor({ name: authorName, iconURL: interaction.guild.iconURL() || undefined })
            .setDescription(content || '*No text content*')
            .setFooter({ text: CLOSE_REMINDER })
            .setTimestamp();

        try {
            await user.send({ embeds: [dmEmbed], files });
        } catch (error) {
            return interaction.reply({ content: '❌ Could not DM the user. They may have DMs disabled, left the server, or blocked the bot.', flags: MessageFlags.Ephemeral });
        }

        // Log the reply in the ticket channel
        const logEmbed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setAuthor({ name: `${interaction.user.tag} replied${anonymous ? ' (anonymous)' : ' (signed)'}`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(content || '*No text content*')
            .setFooter({ text: 'Mods → User' })
            .setTimestamp();

        await interaction.channel.send({ embeds: [logEmbed], files });

        await touchModMailTicket(interaction.channel.id);

        await interaction.reply({ content: '✅ Reply sent to the user.', flags: MessageFlags.Ephemeral });
    }

    // Build a plain-text transcript of the whole ticket channel (user messages, replies, and notes)
    async buildTranscript(channel, ticket, user) {
        // Fetch the full message history (oldest -> newest)
        const all = [];
        let lastId = null;
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;
            const batch = await channel.messages.fetch(options);
            if (batch.size === 0) break;
            all.push(...batch.values());
            lastId = batch.last().id;
            if (batch.size < 100) break;
        }
        all.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        const lines = [];
        lines.push('========================================');
        lines.push('           ModMail Transcript');
        lines.push('========================================');
        lines.push(`User:      ${user ? user.tag : 'Unknown'} (${ticket.userId})`);
        lines.push(`Channel:   ${channel.name} (${channel.id})`);
        lines.push(`Opened:    ${formatDate(ticket.openedAt)}`);
        lines.push(`Closed:    ${formatDate(Date.now())}`);
        lines.push('========================================');
        lines.push('');

        for (const msg of all) {
            const time = formatDate(msg.createdTimestamp);

            if (msg.embeds.length > 0) {
                for (const embed of msg.embeds) {
                    const tag = embed.footer && embed.footer.text ? embed.footer.text : '';
                    const who = embed.author && embed.author.name ? embed.author.name : msg.author.tag;
                    const desc = embed.description || (embed.title || '');
                    let label = '[SYSTEM]';
                    if (tag.includes('User → Mods')) label = '[USER] ';
                    else if (tag.includes('Mods → User')) label = '[REPLY]';
                    lines.push(`[${time}] ${label} ${who}: ${desc}`);
                    if (embed.fields && embed.fields.length > 0) {
                        for (const f of embed.fields) {
                            lines.push(`           ${f.name}: ${f.value}`);
                        }
                    }
                }
            } else if (msg.content) {
                // Plain message in the channel = internal moderator note (not seen by the user)
                lines.push(`[${time}] [NOTE]  ${msg.author.tag}: ${msg.content}`);
            }

            if (msg.attachments.size > 0) {
                for (const att of msg.attachments.values()) {
                    lines.push(`           [attachment] ${att.name} - ${att.url}`);
                }
            }
        }

        return lines.join('\n');
    }

    // Core close routine, reusable by mods, the user (DM), and the auto-close checker.
    // closeMessage is an optional note from the moderators, shown to the user in the close DM.
    // signedBy is the moderator's display name when they choose to close non-anonymously (null = anonymous).
    async performClose(ticket, closedByLabel, closeMessage = null, signedBy = null) {
        const guild = await this.client.guilds.fetch(ticket.guildId).catch(() => null);
        const channel = guild ? await guild.channels.fetch(ticket.channelId).catch(() => null) : null;
        const user = await this.client.users.fetch(ticket.userId).catch(() => null);

        // Build the full transcript from the channel history (if the channel still exists)
        let transcript = '';
        if (channel) {
            try {
                transcript = await this.buildTranscript(channel, ticket, user);
            } catch (error) {
                console.error('Error building ModMail transcript:', error);
            }
        }

        // Persist the close + transcript in the database
        await closeModMailTicket(ticket.channelId, transcript || null);

        // Save the transcript to the portfolio's public folder for a permanent URL
        const transcriptUrl = transcript ? this.saveTranscriptFile(transcript) : null;

        if (user) {
            const closeEmbed = new EmbedBuilder()
                .setColor(COLORS.red)
                .setAuthor({ name: signedBy ? `${MOD_TEAM_NAME} • ${signedBy}` : MOD_TEAM_NAME, iconURL: guild ? (guild.iconURL() || undefined) : undefined })
                .setDescription(`Your ModMail ticket has been closed. If you need anything else, just message me again to open a new ticket.`)
                .setTimestamp();
            if (closeMessage) {
                closeEmbed.addFields({ name: 'Message from the moderators', value: closeMessage.slice(0, 1024), inline: false });
            }
            await user.send({ embeds: [closeEmbed] }).catch(() => {});
        }

        const logClose = new EmbedBuilder()
            .setColor(COLORS.red)
            .setTitle('Ticket Closed')
            .setDescription(`Closed by ${closedByLabel}.`)
            .addFields(
                { name: 'User', value: `${user ? user.tag : 'Unknown'} (${ticket.userId})`, inline: false },
                { name: 'Opened', value: formatDate(ticket.openedAt), inline: true },
                { name: 'Closed', value: formatDate(Date.now()), inline: true }
            )
            .setFooter({ text: `${user ? user.tag : 'Unknown user'} | ${ticket.userId}`, iconURL: user ? user.displayAvatarURL() : undefined })
            .setTimestamp();
        if (closeMessage) {
            logClose.addFields({ name: 'Closing message sent to user', value: closeMessage.slice(0, 1024), inline: false });
        }
        if (transcriptUrl) {
            logClose.addFields({ name: 'Transcript URL', value: transcriptUrl, inline: false });
        }

        const logFiles = [];
        if (transcript) {
            const safe = (user && user.username ? user.username : ticket.userId).replace(/[^a-z0-9]/gi, '') || ticket.userId;
            const buffer = Buffer.from(transcript, 'utf-8');
            logFiles.push(new AttachmentBuilder(buffer, { name: `modmail-${safe}-${ticket.channelId}.txt` }));
        }
        await this.logEvent(logClose, logFiles);

        if (channel) {
            setTimeout(() => channel.delete().catch(() => {}), 5000);
        }
        return true;
    }

    // Write a transcript to the portfolio's public folder and return its URL (unguessable filename)
    saveTranscriptFile(transcript) {
        try {
            fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
            const fileName = `${crypto.randomBytes(24).toString('hex')}.txt`;
            fs.writeFileSync(path.join(TRANSCRIPT_DIR, fileName), transcript, 'utf-8');
            return `${TRANSCRIPT_BASE_URL}/${fileName}`;
        } catch (error) {
            console.error('Error saving ModMail transcript file:', error);
            return null;
        }
    }

    // Close a ticket from the moderator-side /close slash command (run in the ticket channel)
    async closeTicket(interaction) {
        const ticket = await getTicketByChannel(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This channel is not an active ModMail ticket.', flags: MessageFlags.Ephemeral });
        }

        // Building the transcript may take a moment, so defer the reply
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const closeMessage = interaction.options.getString('message');
        const anonymous = interaction.options.getBoolean('anonymous');
        const signedBy = (anonymous === null ? true : anonymous) ? null : interaction.member.displayName;
        await this.performClose(ticket, `moderator ${interaction.user.tag}`, closeMessage, signedBy);
        await interaction.editReply({ content: `✅ Ticket closed and transcript saved to the log channel.${closeMessage ? ' Your closing message was sent to the user.' : ''} This channel will be deleted in 5 seconds.` });
    }

    // The user typed /close in DMs - ask them to confirm (auto-closes in 60 minutes otherwise)
    async requestCloseFromUser(message) {
        const ticket = await getOpenTicketByUser(message.author.id);
        if (!ticket) {
            await message.reply('You do not have an open ModMail ticket. Send me a message to open one.').catch(() => {});
            return;
        }

        await setCloseRequested(ticket.channelId, Date.now());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('modmail_close_confirm').setLabel('Confirm Close').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('modmail_close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setColor(COLORS.yellow)
            .setTitle('Close your ticket?')
            .setDescription('Are you sure you want to close your ModMail ticket?\n\nClick **Confirm Close** to close it now. If you do nothing, it will **close automatically in 60 minutes**.')
            .setTimestamp();

        await message.reply({ embeds: [embed], components: [row] }).catch(() => {});

        // Let the moderators know the user has requested closure
        const channel = await this.client.channels.fetch(ticket.channelId).catch(() => null);
        if (channel) {
            const note = new EmbedBuilder()
                .setColor(COLORS.yellow)
                .setDescription(`ℹ️ ${message.author.tag} requested to close this ticket. It will auto-close in 60 minutes unless they cancel or a moderator acts.`)
                .setTimestamp();
            await channel.send({ embeds: [note] }).catch(() => {});
        }
    }

    // Handle the confirm/cancel buttons from the user's DM
    async handleCloseButton(interaction) {
        const ticket = await getOpenTicketByUser(interaction.user.id);

        if (interaction.customId === 'modmail_close_confirm') {
            if (!ticket) {
                return interaction.update({ content: 'This ticket is already closed.', embeds: [], components: [] }).catch(() => {});
            }
            await interaction.update({ content: '✅ Closing your ticket now. Thank you for reaching out!', embeds: [], components: [] }).catch(() => {});
            await this.performClose(ticket, `the user ${interaction.user.tag}`);
            return;
        }

        if (interaction.customId === 'modmail_close_cancel') {
            if (ticket) {
                await setCloseRequested(ticket.channelId, null);
            }
            await interaction.update({ content: `👍 Your ticket will stay open. ${CLOSE_REMINDER}`, embeds: [], components: [] }).catch(() => {});
        }
    }

    // Periodically auto-close tickets (60-min pending confirmations + 7-day inactivity)
    async checkAutoClose() {
        try {
            const now = Date.now();
            const openTickets = await getAllOpenTickets();

            for (const ticket of openTickets) {
                // The user ran /close but never confirmed within 60 minutes
                if (ticket.closeRequestedAt && (now - ticket.closeRequestedAt) >= SIXTY_MINUTES_MS) {
                    await this.performClose(ticket, 'the user (no confirmation within 60 minutes)');
                    continue;
                }

                // No activity for 7 days (based on lastUpdate stored in the DB)
                if (ticket.lastUpdate && (now - ticket.lastUpdate) >= SEVEN_DAYS_MS) {
                    await this.performClose(ticket, 'auto-close (no response for 7 days)');
                }
            }
        } catch (error) {
            console.error('ModMail auto-close check error:', error);
        }
    }

    // Start the recurring auto-close checker
    startAutoCloseChecker() {
        this.checkAutoClose();
        setInterval(() => this.checkAutoClose(), 5 * 60 * 1000); // every 5 minutes
    }
}

module.exports = ModMailManager;
