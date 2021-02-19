import { sign } from "crypto";
import { Message } from "discord.js";
import BotManager from "../BotManager";
import DBManager from "../DBManager";
import { Question } from "../entity/Question";
import BotCommand from "./BotCommand";

class QuestionCommand extends BotCommand {

    command = 'question';
    args = undefined;

    async commandHandler(msg: Message) {
        //validate if question is safe to use
        if(this.validateChannel(msg) && this.validateArgs(msg) && this.validateProfanity(msg) && this.validateUserRole(msg)) { 
            const session = await BotManager.getLatestActiveQuestionSession();
            if(session) {

                if(session.pollactive) {
                    if(msg.deletable) {
                        msg.delete();
                    }
                    msg.author.send(`Your question \`${this.args.join(" ")}\` has been deleted from the channel because a poll is currently active. You can submit the question in the next session`);
                    return;
                }

                const question = new Question();
                question.content = this.args.join(" ");
                question.user = this.user;
                question.questionsession = session;

                question.guildId = msg.guild.id;
                question.channelId = msg.channel.id;
                question.messageId = msg.id;

                await BotManager.database.connection.manager.save(question);
                msg.react('✅');
            } else {
                msg.react('❌')
                msg.reply("Unfortunately there are no active AMA sessions where you can submit questions for.");
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
            return false;
        }

        return true;
    }

    validateProfanity(msg: Message) : boolean  {
        const found = BotManager.profanityWords.filter((word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(this.args.join(" "));
        });

        if(found.length) {
            if(msg.deletable) {
                msg.delete();
                msg.author.send("Your question has been deleted because it violated the server rules");
            } else {
                msg.react('❌')
            }

            return false;
        }

        return true;
    }

    validateUserRole(msg: Message) : boolean {

        if(msg.member.roles.cache.some(r => r.name === 'medium')) {
            return true;
        }

        msg.author.send("AMA questions are only for the Medium Patreon tier, you can upgrade your Patreon and participate in the Ask Me Anything \n https://www.patreon.com/stuffmadehere/")
        msg.react('❌')

        return false;
    }


    validateChannel(msg: Message) : boolean {
        if(msg.channel.type === 'dm' && (msg.author.id == '258690128396943360' || msg.author.id == '486773876005797888')) {
            msg.reply('Questions can only be asked in the offical StuffMadeHere discord server');
            return false
        }

        return true;
    }

    getHelpMessageContent() {
        return false;
    }
}

export default (QuestionCommand);
