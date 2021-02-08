import { Message } from 'discord.js';
import BotManager from '../BotManager';
import DBManager from '../DBManager';
import { User } from '../entity/User';

class BotCommand {
    command: string;
    prefix: string;
    user: User;

    getPrefix() {
        if(BotManager.config.prefix !== undefined) {
            return BotManager.config.prefix;
        } else {
            return '!';
        }
    }

    init() {
        BotManager.client.on('message', async (msg) => { 
            if (this.validateCommand(msg)) {
                this.user = await this.getUser(msg);

                if(this.validateCooldown(this.user)) {
                    this.user.lastSend = new Date().toISOString();
                    await BotManager.database.connection.manager.save(this.user);
                    this.commandHandler(msg);
                }
            }
        })
    }

    validateCommand(msg: Message) {
        return msg.content === this.getPrefix() + this.command;
    }

    async getUser(msg: Message) {
        const user = await BotManager.database.getUser(msg.author.id);

        if(user === undefined) {
            const newUser = new User(msg.author.id, msg.author.username, msg.author.bot);
            await BotManager.database.connection.manager.save(newUser);
            return newUser;
        } else {
            return user;
        }
    }

    validateCooldown(user: User) {

        const lastSendDate = new Date(user.lastSend);
        const addedDate = new Date(user.added);

        if(lastSendDate.getTime() === addedDate.getTime()) {
            return true;
        }

        const currentDate = new Date();

        const timeDiff = Math.abs(currentDate.getTime() - lastSendDate.getTime()) / 1000;
        return timeDiff > BotManager.config.cooldownTime;
    }

    commandHandler(msg: Message) {
        msg.channel.send('ERROR: Command not implemented'); 
        console.log('Command not implemented');
    }

    getHelpMessage() {
        return this.getPrefix() + this.command + ' - ' + this.getHelpMessageContent() + '\n';
    } 

    getHelpMessageContent() : string | boolean {
        throw new Error('Help message for '+ this.command +' not implemented');
    }
}

export default BotCommand;