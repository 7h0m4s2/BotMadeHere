import { Message } from "discord.js";
import BotManager from "../BotManager";
import DBManager from "../DBManager";
import { Question } from "../entity/Question";
import { QuestionSession } from "../entity/QuestionSession";
import { User } from "../entity/User";
import BotCommand from "./BotCommand";

const ObjectsToCsv = require('objects-to-csv');

class ExportQuestions extends BotCommand {

    command = 'exportquestions';
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
            msg.author.send("Missing arguments! USAGE: \n\n !exportquestions {SessionID}");
            return false;
        }

        return true;
    }

    validateUser(msg: Message) : boolean {
        if(msg.channel.type === 'dm' && (msg.author.id == '258690128396943360' || msg.author.id == '486773876005797888')) {
            return true
        }

        return false;
    }

    async createDataset(msg: Message) {        
        const sessionID = this.args[0];

        if(!sessionID) {
            msg.author.send("Missing sessionID");
            return;
        }

        const questions = await BotManager.database.connection
            .getRepository(Question)
            .createQueryBuilder("question")
            .leftJoinAndSelect("question.user", "user")
            .leftJoinAndSelect("question.questionsession", "questionsession")
            .where("question.questionsession = :id", { id: sessionID })
            .getMany();

        if(!questions) {
            msg.author.send("There are no questions found");
            return;
        } else {

            const newQuestions = [];

            for (const question of questions) {

                const questionDate = new Date(question.added);
                const messageLinkId = `https://discord.com/channels/${question.guildId}/${question.channelId}/${question.messageId}`;

                newQuestions.push({
                    "username": question.user.username,
                    "question": question.content,
                    "date": questionDate.toLocaleDateString(),
                    "votes": question.votes,
                    "session": question.questionsession.id,
                    "sessionName": question.questionsession.name,
                    "messageLink": messageLinkId
                });
            }

            console.log(questions);
            const date = new Date();
            const exportName = `./exports/export_${sessionID}_${date.getMonth() + 1}${date.getDate()}${date.getFullYear()}${date.getHours()}${date.getMinutes()}.csv`;

            const csv = new ObjectsToCsv(newQuestions);
            const csvData = await csv.toDisk(exportName);

            msg.author.send("I have generated the export", {files: [exportName]});
        }
    }

    getHelpMessageContent() {
        return false;
    }
}

export default (ExportQuestions);
