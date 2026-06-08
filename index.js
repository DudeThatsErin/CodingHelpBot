/*
  r/CodingHelp
  USING DISCORD.JS V14.6.0
*/
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection, Options } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,        // member joins/leaves/updates (privileged)
    GatewayIntentBits.GuildModeration,     // ban/unban events
    GatewayIntentBits.GuildVoiceStates,    // voice channel activity
    GatewayIntentBits.GuildExpressions,    // emoji/sticker changes
    GatewayIntentBits.GuildWebhooks,       // webhook create/update/delete
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,      // message edit/delete content (privileged)
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
  // Cap the caches that grow unbounded on a large server. Anything not listed keeps its default.
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    MessageManager: 100,                   // cached messages per channel (default 200)
    GuildMemberManager: {                  // don't hold every member of a 21k+ server in RAM
      maxSize: 200,
      keepOverLimit: member => member.id === member.client.user.id,
    },
    UserManager: {
      maxSize: 200,
      keepOverLimit: user => user.id === user.client.user.id,
    },
    PresenceManager: 0,                    // presences aren't used (no GuildPresences intent)
  }),
  // Periodically evict stale entries so caches don't creep up over days of uptime.
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: { interval: 3600, lifetime: 10800 },                                    // drop messages older than 3h, hourly
    users: { interval: 3600, filter: () => user => user.id !== user.client.user.id }, // keep only the bot long-term
    guildMembers: { interval: 3600, filter: () => member => member.id !== member.client.user.id },
  },
});


// configurations
const config = require('./config/config.json');
const { initializeCoreTables } = require('./database-init.js');

client.commands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.slashCooldowns = new Collection();
client.erinCommands = new Collection();
const { cooldowns, slashCooldowns } = client;

// Initialize core database tables on startup
initializeCoreTables();


// for all commands
function readFilesFromPath(pathString) {
  const directoryEntries = fs.readdirSync(pathString, { withFileTypes: true });

  return directoryEntries.reduce((filteredEntries, dirEnt) => {
    if (dirEnt.isDirectory()) {
      // If the entry is a directory, call this function again
      // but now add the directory name to the path string.
      filteredEntries.push(...readFilesFromPath(`${pathString}/${dirEnt.name}`))
    } else if (dirEnt.isFile()) {
      // Check if the entry is a file instead. And if so, check
      // if the file name ends with `.js`.
      if (dirEnt.name.endsWith('.js')) {
        // Add the file to the command file array.
        filteredEntries.push(`${pathString}/${dirEnt.name}`);
      }
    }

    return filteredEntries;
  }, []);
}

console.log('|-----------------------------------|');
console.log('       Loading Challenge Commands... ');
console.log('|-----------------------------------|');
// Call the read files function with the root folder of the commands and
// store all the file paths in the constant.
const commandFilePaths = readFilesFromPath('./commands');

// Loop over the array of file paths and set the command on the client.
commandFilePaths.forEach((filePath) => {
  const command = require(filePath);

  client.commands.set(command.name, command);
  console.log(command.name + ' loaded successfully!');
});


// create slash commands
console.log('|-----------------------------------|')
console.log('      Loading Slash Commands...      ')
console.log('|-----------------------------------|')
const commandFilePaths1 = readFilesFromPath('./slashcommands');

commandFilePaths1.forEach((filePath) => {
  const cmd = require(filePath);

  client.slashCommands.set(cmd.name, cmd);
  console.log(cmd.name + ' loaded successfully!');
});

// create test server only slash commands
console.log('|-----------------------------------|')
console.log('     Loading Erin Slash Commands...  ')
console.log('|-----------------------------------|')

const commandFilePaths2 = readFilesFromPath('./my-server-only');

commandFilePaths2.forEach((filePath) => {
  const cmdd = require(filePath);

  client.erinCommands.set(cmdd.name, cmdd);
  // CHANGE THIS TO slashCommands ON TEST BOT.
  console.log(cmdd.name + ' loaded successfully!');
});

// events
console.log('|-----------------------------------|')
console.log('       Loading Event Files...        ')
console.log('|-----------------------------------|')
const eventFiles = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`${__dirname}/events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
  console.log(event.name + ' loaded successfully!');
}


// end of file
(async () => {
  connection = await require('./database.js');
  await client.login(config.token);
})();
