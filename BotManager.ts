import {Client} from 'discord.js';
import AMASession from './Commands/AMASession';
import BotCommand from './Commands/BotCommand';
import { HelpCommand, NotifyYoutube, RulesCommand, QuestionCommand, ExportQuestions, QuestionPoll, QuestionPollStop, Concepts } from './Commands/Commands';
import DBManager from './DBManager';
import { QuestionSession } from './entity/QuestionSession';
import GarbageListerner from './Listeners/GarbageListeners';
import GrizzlyListerner from './Listeners/GrizzlyListeners';
import PollVoteListerner from './Listeners/PollVoteListerner';
import RuleSixListerner from './Listeners/RuleSixListerner';


const config = require('./config.json');
var fs = require("fs");

class BotManager {

    client: Client;
    name = 'Bot';
    config: any;
    commands = Array<BotCommand>();
    database: DBManager;
    profanityWords = [];

    async init() {

        this.readConfig();
        this.database = await new DBManager().createConnection();

        const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
        client.login(this.config.token);
        this.client = client;

        client.on('ready', () => {
          console.log(`Logged in as ${client.user.tag}!`);
          client.user.setActivity(" internet pool ", {type: 1});
        });

        this.initCommands();
        this.initListeners();
        this.initProfanity();
        this.getLatestActiveQuestionSession();

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
        this.commands.push(new QuestionCommand());
        this.commands.push(new AMASession());
        this.commands.push(new ExportQuestions());
        this.commands.push(new QuestionPoll());
        this.commands.push(new QuestionPollStop());
        this.commands.push(new Concepts());

        for (const command of this.commands) {
            command.init();
        }
    }

    initListeners() {
       new GrizzlyListerner();
       new PollVoteListerner();
       new GarbageListerner();
       new RuleSixListerner();
    }

    initProfanity() {
        var fs = require("fs");
        var text = fs.readFileSync("./profanity-list.txt").toString('utf-8');
        var textByLine = text.split("\r\n")
        this.profanityWords = textByLine;
    }

    async getLatestActiveQuestionSession() {
        const lastestSession = await this.database.connection
            .getRepository(QuestionSession)
            .createQueryBuilder("session")
            .orderBy({ "session.id": "DESC"} )
            .where("session.active = :state", { state: true })
            .getOne();

        return lastestSession;
    }
}

export default (new BotManager);