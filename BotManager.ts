import {Client} from 'discord.js';
import BotCommand from './Commands/BotCommand';
import { HelpCommand, NotifyYoutube, RulesCommand } from './Commands/Commands';
import DBManager from './DBManager';
import GrizzlyListerner from './Listeners/GrizzlyListeners';

const config = require('./config.json')

class BotManager {

    client: Client;
    name = 'Bot';
    config: any;
    commands = Array<BotCommand>();
    database: DBManager;

    init() {

        this.readConfig();
        this.database = new DBManager()

        const client = new Client();
        client.login(this.config.token);
        this.client = client;

        client.on('ready', () => {
          console.log(`Logged in as ${client.user.tag}!`);
        });

        this.initCommands();
        this.initListeners();
    }

    readConfig() {
        this.config = config;

        if(config.name !== undefined) {
            this.name = config.name;
        }
    }

    initCommands() {
        this.commands.push(new HelpCommand());
        this.commands.push(new RulesCommand());
        this.commands.push(new NotifyYoutube());

        for (const command of this.commands) {
            command.init();
        }
    }

    initListeners() {
       new GrizzlyListerner();
    }
}

export default (new BotManager);