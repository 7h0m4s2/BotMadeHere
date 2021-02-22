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

class QuestionPollStop extends BotCommand {

    command = 'stoppoll';
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

            msg.author.send("Missing arguments! USAGE: \n\n !stoppoll {SessionID}");
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
            .getRepository(QuestionPollMessage)
            .createQueryBuilder("pollmessage")
            .leftJoinAndSelect("pollmessage.question", "question")
            .leftJoinAndSelect("question.questionsession", "questionsession")
            .where("questionsession.id = :id", { id: sessionID})
            .getMany();

        if(!questions) {
            msg.author.send("There are no questions found");
            return;
        } else {

            if(msg.channel.type === 'text') {
                const textChannel = (msg.channel as TextChannel);

                textChannel.setTopic("Previous AMAs are pinned. Throw questions in here with the !question command. I'll use this as a basis for monthly AMAs");

                const role = msg.guild.roles.cache.find(role => role.name === "medium");

                try {
                    textChannel.overwritePermissions([
                        {
                           id: role.id,
                           allow: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MANAGE_MESSAGES'],
                        },
                      ], 'Reopen channel => poll is over')
                } catch(err) {
                    console.log(err);
                }
                
            }


            for (const question of questions) {
                const channel = msg.guild.channels.cache.get(question.channelId);
                const message = await (channel as TextChannel).messages.fetch(question.messageId);
                const reaction = message.reactions.cache.get("⬆️");

                const votes = (await reaction.fetch()).count - 1; //Remove one from the bot itself;

                await BotManager.database.connection
                    .createQueryBuilder()
                    .update(Question)
                    .set({ votes: votes })
                    .where("id = :id", { id: question.question.id })
                    .execute();

                await BotManager.database.connection
                    .createQueryBuilder()
                    .update(QuestionSession)
                    .set({ pollactive: false })
                    .where("id = :id", { id: question.question.questionsession.id })
                    .execute();
            }

            msg.author.send(`Stopped poll in ${msg.guild.name}`);
        }
    }

    getHelpMessageContent() {
        return false;
    }
}

export default (QuestionPollStop);
