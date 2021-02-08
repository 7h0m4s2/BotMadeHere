import { Message } from "discord.js";
import BotManager from "../BotManager";
import DBManager from "../DBManager";
import { Question } from "../entity/Question";
import { QuestionSession } from "../entity/QuestionSession";
import BotCommand from "./BotCommand";

class AmaSession extends BotCommand {

    command = 'amasession';
    args = undefined;

    async commandHandler(msg: Message) {
        //validate if question is safe to use
        if(this.validateUser(msg) && this.validateArgs(msg)) { 
            console.log(this.args);
            switch(this.args[0]) {
                case('list'):
                    this.showList(msg);
                    break;
                case('create'):
                    this.createSession(msg);
                    break;
                case('activate'):
                    this.activateSession(msg);
                    break;
                case('deactivate'):
                    this.deactivateSession(msg);
                    break;
           }
        }
    }


    validateCommand(msg: Message) : boolean {
        if (msg.author.bot) return false;

        this.args = msg.content.slice(this.getPrefix().length).trim().split(/ +/);
        const command = this.args.shift().toLowerCase();

        return command === this.command;
    }

    validateArgs(msg: Message) : boolean {
        if(!this.args.length) {
            msg.react('❌')
            msg.author.send("Missing arguments! USAGE: \n\n !amasession list \n !amasession create {name} \n !amasession activate {sessionID} \n !amasession deactivate {sessionId}");
            return false;
        }

        return true;
    }

    validateUser(msg: Message) : boolean {
        if(msg.channel.type === 'dm' && msg.author.id == '258690128396943360') {
            return true
        }

        return false;
    }

    async showList(msg: Message) {
        const data = await BotManager.database.connection
            .getRepository(QuestionSession)
            .createQueryBuilder("session")
            .getMany();

        if(!data) {
            msg.author.send("There are no sessions found");
            return;
        } else {

            let content = `There are ${data.length} sessions found \n\n`;

            for (const session of data) {
                const date = new Date(session.created);
                const active = session.active ? "ACTIVE" : "INACTIVE";
                content += `ID: ${session.id} => \`${session.name}\` created ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()} - ${active} \n`;
            }

            msg.author.send(content);
        }
    }

    async createSession(msg: Message) {
        this.args.shift();
        const data = this.args;
        
        const questionSession = new QuestionSession();
        questionSession.name = data.join(" ");
        const inserted = await BotManager.database.connection.manager.save(questionSession);
        msg.author.send(`Created session \`${inserted.name}\` with id: \`${inserted.id}\``)
    }

    async activateSession(msg: Message) {
        this.args.shift();
        const data = this.args;
        
        const sessionID = data[0];

        if(!sessionID) {
            msg.author.send("Missing sessionID");
            return;
        }

        const session = await BotManager.database.connection
            .getRepository(QuestionSession)
            .createQueryBuilder("session")
            .where("session.id = :id", { id: sessionID })
            .getOne();

        if (session) {
             // UPDATE all other sessions to inactive;
             await BotManager.database.connection
                .createQueryBuilder()
                .update(QuestionSession)
                .set({ active: false})
                .execute();

            await BotManager.database.connection
                .createQueryBuilder()
                .update(QuestionSession)
                .set({ active: true})
                .where("id = :id", { id: session.id })
                .execute();

            msg.author.send(`Activated session with id \`${sessionID}\``);
        } else {
            msg.author.send(`No session with id \`${sessionID}\``);
        }
    }

    async deactivateSession(msg: Message) {
        this.args.shift();
        const data = this.args;
        
        const sessionID = data[0];

        if(!sessionID) {
            msg.author.send("Missing sessionID");
            return;
        }

        const session = await BotManager.database.connection
            .getRepository(QuestionSession)
            .createQueryBuilder("session")
            .where("session.id = :id", { id: sessionID })
            .getOne();

        if (session) {
            await BotManager.database.connection
                .createQueryBuilder()
                .update(QuestionSession)
                .set({ active: false})
                .where("id = :id", { id: session.id })
                .execute();

            msg.author.send(`Deactivated session with id \`${sessionID}\``);
        } else {
            msg.author.send(`No session with id \`${sessionID}\``);
        }
    }

    getHelpMessageContent() {
        return false;
    }
}

export default (AmaSession);
