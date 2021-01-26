import { Message, TextChannel } from "discord.js";
import BotManager from "../BotManager";
import BotCommand from "./BotCommand";


class RulesCommand extends BotCommand {
    command = 'rules';

    async commandHandler(msg: Message) {
        const serverChannels = await BotManager.client.channels.cache;
        let rulesMessage = undefined;

        for (const channel of serverChannels) {
            if(channel[1].type === 'text') {
                const currentChannel = (channel[1] as TextChannel);
                if(currentChannel.name === BotManager.config.rules_channel) {
                    rulesMessage = currentChannel.messages.fetch(currentChannel.lastMessageID);
                }
            }
        }

        if(rulesMessage !== undefined) {
            msg.channel.send((await rulesMessage).cleanContent);
        }
    }    

    getHelpMessageContent() {
        return 'shows the rules';
    }
}

export default RulesCommand;