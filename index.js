/*
  r/CodingHelp
  USING DISCORD.JS V14.6.0
*/
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection, REST } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers ], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });

// Create a shared REST instance for the entire bot
const config = require('./config/config.json');
const rest = new REST({ version: '10' }).setToken(config.token);

// Set up rate limit event listener on the shared REST instance
rest.on('rateLimited', (info) => {
  console.log(`🚫 Rate limited! Timeout: ${info.timeout}ms, Limit: ${info.limit}, Method: ${info.method}, Path: ${info.route}`);
});

// Attach the shared REST instance to the client immediately
client.rest = rest;
console.log('✅ REST instance created and attached to client at startup');


// configurations
client.commands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.slashCooldowns = new Collection();
client.erinCommands = new Collection();
const { cooldowns, slashCooldowns } = client;


// for all commands
let data = [];
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

console.log('|-----------------------------------');
console.log('       Loading --prefix Commands... ');
console.log('|-----------------------------------|');
// Call the read files function with the root folder of the commands and
// store all the file paths in the constant.
const commandFilePaths = readFilesFromPath('./commands');

// Loop over the array of file paths and set the command on the client.
commandFilePaths.forEach((filePath) => {
  // Clear require cache and reload command
  delete require.cache[require.resolve(filePath)];
  
  try {
    console.log(`Attempting to load: ${filePath}`);
    const command = require(filePath);
    console.log(`Command object:`, command);
    client.commands.set(command.name, command);
    console.log(command.name + ' loaded successfully!');
  } catch (error) {
    console.error(`Error loading command ${filePath}:`, error.message);
  }
});


// create slash commands
console.log('|-----------------------------------|')
console.log('      Loading Slash Commands...      ')
console.log('|-----------------------------------|')
const commandFilePaths1 = readFilesFromPath('./slashcommands');

commandFilePaths1.forEach((filePath) => {
  // Clear require cache and reload command
  delete require.cache[require.resolve(filePath)];
  
  try {
    const cmd = require(filePath);
    client.slashCommands.set(cmd.name, cmd);
    console.log(cmd.name + ' loaded successfully!');
  } catch (error) {
    console.error(`Error loading slash command ${filePath}:`, error.message);
  }
});

// create test server only slash commands
console.log('|-----------------------------------|')
console.log('     Loading Erin Slash Commands...  ')
console.log('|-----------------------------------|')

const commandFilePaths2 = readFilesFromPath('./my-server-only');

commandFilePaths2.forEach((filePath) => {
  // Clear require cache and reload command
  delete require.cache[require.resolve(filePath)];
  
  try {
    const cmdd = require(filePath);
    client.erinCommands.set(cmdd.name, cmdd);
    console.log(cmdd.name + ' loaded successfully!');
  } catch (error) {
    console.error(`Error loading erin command ${filePath}:`, error.message);
  }
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


// Database and login
console.log('Connected to the SQLite database at: /var/www/CodingHelpBot/bot.db');
console.log('|-----------------------------------');
console.log('          Logging In...             ');
console.log('|-----------------------------------');
console.log('   r/CodingHelp#6894 is');
console.log('   logged in and ready!');
console.log('|-----------------------------------');
console.log('Verifying REST instance...');
console.log('REST instance attached to client:', !!client.rest);
console.log('✅ REST instance ready for use');
console.log('|-----------------------------------');
console.log('             Error Logs...           ');
console.log('|-----------------------------------');

// Start the bot (commands are deployed via createcommands prefix command)
(async () => {
  const db = await require('./database.js');
  await client.login(config.token);
})();
