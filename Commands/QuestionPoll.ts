import { Message, TextChannel } from "discord.js";
import { send } from "process";
import BotManager from "../BotManager";
import DBManager from "../DBManager";
import { Question } from "../entity/Question";
import { QuestionPollMessage } from "../entity/QuestionPollMessage";
import { QuestionSession } from "../entity/QuestionSession";
import { User } from "../entity/User";
import BotCommand from "./BotCommand";

const ObjectsToCsv = require('objects-to-csv');

class QuestionPoll extends BotCommand {

    command = 'createpoll';
    args = undefined;

    async commandHandler(msg: Message) {
        //validate if question is safe to use
        if(this.validateUser(msg) && this.validateArgs(msg)) { 
            this.createDataset(msg);
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

            try {
                if(msg.deletable) {
                    msg.delete();
                }
            } catch (err) {
                console.log(err);
            }
            
            msg.author.send("Missing arguments! USAGE: \n\n !createpoll {SessionID}");
            return false;
        }

        return true;
    }

    validateUser(msg: Message) : boolean {
        if(msg.channel.type !== 'dm' && (msg.author.id == '258690128396943360' || msg.author.id == '486773876005797888')) {
            return true
        }

        return false;
    }

    async createDataset(msg: Message) {        
        const sessionID = this.args[0];

        try {
            if(msg.deletable) {
                msg.delete();
            }
        } catch (err) {
            console.log(err);
        }
       

        if(!sessionID) {
            msg.author.send("Missing sessionID");
            return;
        }

        const questions = await BotManager.database.connection
            .getRepository(Question)
            .createQueryBuilder("question")
            .leftJoinAndSelect("question.user", "user")
            .leftJoinAndSelect("question.questionsession", "questionsession")
            .where("question.questionsession = :id AND question.inpoll = :inpoll", { id: sessionID, inpoll: true })
            .getMany();

        if(!questions) {
            msg.author.send("There are no questions found");
            return;
        } else {

            if(msg.channel.type === 'text') {
                const textChannel = (msg.channel as TextChannel);

                textChannel.setTopic(`Holding poll for ${questions[0].questionsession.name}`)

                const role = msg.guild.roles.cache.find(role => role.name === "medium");

                try {
                    textChannel.overwritePermissions([
                        {
                           id: role.id,
                           deny: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MANAGE_MESSAGES'],
                        },
                      ], 'Lockdown for poll')
                } catch(err) {
                    console.log(err);
                }
               
            }

            await BotManager.database.connection
                .createQueryBuilder()
                .update(QuestionSession)
                .set({ pollactive: true })
                .where("id = :id", { id: sessionID })
                .execute();

            for (const question of questions) {
                msg.channel.send(`${question.user.username} - ${question.content}`)
                    .then(async sendMsg => {
                        sendMsg.react("⬆️");

                        const dbMessage = await BotManager.database.connection
                            .getRepository(QuestionPollMessage)
                            .createQueryBuilder("pollMessage")
                            .where("pollMessage.question = :id", { id: question.id})
                            .getOne();

                        if(dbMessage) {
                            dbMessage.messageId = sendMsg.id;
                            dbMessage.channelId = sendMsg.channel.id;
                            BotManager.database.connection.manager.save(dbMessage);
                         } else {
                            const pollMessage = new QuestionPollMessage();
                            pollMessage.messageId = sendMsg.id;
                            pollMessage.channelId = sendMsg.channel.id;
                            pollMessage.question = question;
                            BotManager.database.connection.manager.save(pollMessage);
                         }
                    });
            }

            msg.author.send(`Created poll in ${msg.guild.name}`);
        }
    }

    getHelpMessageContent() {
        return false;
    }
}

export default (QuestionPoll);
