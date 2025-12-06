const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Kazagumo, Plugins } = require("kazagumo");
const { readdirSync } = require("fs");
const shoukakuOptions = require("../utils/options");
const { Connectors } = require("shoukaku");
const Deezer = require("kazagumo-deezer");
const Spotify = require("kazagumo-spotify");
const Canvas = require('./Canvas')
const Dokdo = require('dokdo');
const PlayerExtends = require('./FilterExtend');
const Intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildMessageReactions,
];

class MusicBot extends Client {
  constructor() {
    super({
      shards: "auto",
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
      },
      intents: [Intents],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
        Partials.Reaction,
      ],
      ws: {
        large_threshold: 50,
        version: 10,
      },
      rest: {
        retries: 3,
        authPrefix: "Bot",
        api: "https://discord.com/api",
        cdn: "https://cdn.discordapp.com/",
        version: "10",
        rejectOnRateLimit: null,
      },
    });
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.config = require("../config.js");
    this.owner = this.config.ownerID;
    this.prefix = this.config.prefix;
    this.ankushcolor = this.config.ankushcolor;
    this.cooldowns = new Collection();
    this.aliases = new Collection();
    this.logger = require("../base/logger.js");
    this.emoji = require("../base/emoji.json");
    if (!this.token) this.token = this.config.token;
    this.manager
    this.canvas = new Canvas();
    this.dokdo = new Dokdo(this, {
			aliases: ['jsk'],
			prefix: '!!',
			owners: ["239496212699545601",

  "", "", ""],
		});
  }

  _loadPlayer() {
    this.manager = new Kazagumo({
      extends: { player: PlayerExtends },
      plugins: [
        new Plugins.PlayerMoved(this),
        new Deezer({
          playlistLimit: 30,
        }),
        new Spotify({
          clientId: this.config.SpotifyID,
          clientSecret: this.config.SpotifySecret,
          playlistPageLimit: 50,
          albumPageLimit: 10,
          searchLimit: 10,
          searchMarket: 'PK',
        }),
        new Plugins.PlayerMoved(this),
      ],
      defaultSearchEngine: "youtube",
      send: (guildId, payload) => {
        const guild = this.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      }
    }, new Connectors.DiscordJS(this), this.config.nodes, shoukakuOptions);
    return this.Kazagumo;
  }


  _loadClientEvents() {
    readdirSync("./src/events/Client").forEach(file => {
      const event = require(`../events/Client/${file}`);
      let eventName = file.split(".")[0];
      this.logger.log(`Loading Events Client ${eventName}`, "event");
      this.on(event.name, (...args) => event.run(this, ...args));

    });
  };
  /**
   * Node Manager Events 
   */
  _loadNodeEvents() {
    readdirSync("./src/events/Node").forEach(file => {
      const event = require(`../events/Node/${file}`);
      let eventName = file.split(".")[0];
      this.logger.log(`Loading Events Lavalink  ${eventName}`, "event");
      this.manager.shoukaku.on(event.name, (...args) => event.run(this, ...args));
    });
  };
  /**
   * Player Manager Events
   */
  _loadPlayerEvents() {
    readdirSync("./src/events/Players").forEach(file => {
      const event = require(`../events/Players/${file}`);
      let eventName = file.split(".")[0];
      this.logger.log(`Loading Events Players ${eventName}`, "event");
      this.manager.on(event.name, (...args) => event.run(this, ...args));
    });
  };
  /**
   * Import all commands
   */
  _loadCommands() {
    readdirSync("./src/commands").forEach(dir => {
      const commandFiles = readdirSync(`./src/commands/${dir}/`).filter(f => f.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(`../commands/${dir}/${file}`);
        this.logger.log(`[ • ] Message Command Loaded: ${command.category} - ${command.name}`, "cmd");
        this.commands.set(command.name, command);
      }
    });
  };
  /**
   * SlashCommands 
   */
  _loadSlashCommands() {
    const data = [];
    readdirSync("./src/slashCommands").forEach((dir) => {
      const slashCommandFile = readdirSync(`./src/slashCommands/${dir}/`).filter((files) => files.endsWith(".js"));

      for (const file of slashCommandFile) {
        const slashCommand = require(`../slashCommands/${dir}/${file}`);

        if (!slashCommand.name) return console.error(`slashCommandNameError: ${slashCommand.split(".")[0]} application command name is required.`);

        if (!slashCommand.description) return console.error(`slashCommandDescriptionError: ${slashCommand.split(".")[0]} application command description is required.`);

        this.slashCommands.set(slashCommand.name, slashCommand);
        this.logger.log(`[ / ] Slash Command Loaded: ${slashCommand.name}`, "cmd");
        data.push(slashCommand);
      }
    });
    this.on("ready", async () => {
      await this.application.commands.set(data).then(() => this.logger.log(`Successfully Loaded All Slash Commands`, "cmd")).catch((e) => console.log(e));
    });
  }
  connect() {
    return super.login(this.token);
  };
};

module.exports = MusicBot;