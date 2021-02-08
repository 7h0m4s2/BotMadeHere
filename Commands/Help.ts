import { Message } from 'discord.js';
import BotManager from '../BotManager';
import BotCommand from './BotCommand';

class HelpCommand extends BotCommand {

    command = 'help';


    commandHandler(msg: Message) {
        let content = 'The Bot Made Here help menu \n\n';

        for (const command of BotManager.commands) {
            try {
                if(command.getHelpMessage()) {
                    content += command.getHelpMessage();
                }
            } catch(err) {
                console.log(err);
            }
        }

        msg.channel.send(content);
    }

    getHelpMessageContent() {
        return 'This help menu';
    }
}

export default (HelpCommand);