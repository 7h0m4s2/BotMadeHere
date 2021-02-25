import { Message } from 'discord.js';
import BotManager from '../BotManager';
import BotCommand from './BotCommand';

class Concepts extends BotCommand {

    command = 'drawingapp';


    commandHandler(msg: Message) {
        let content = 'SMH uses the drawing app Concepts, check it out here: https://concepts.app/';

        msg.channel.send(content);
    }

    getHelpMessageContent() {
        return false;
    }
}

export default (Concepts);