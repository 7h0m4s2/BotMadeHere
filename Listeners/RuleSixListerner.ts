import { Role } from "discord.js";
import BotManager from "../BotManager";

class RuleSixListerner {

    constructor() {
        BotManager.client.on('message', (msg) => {
            if(msg.content.includes('rule 6')) {
                msg.react(BotManager.client.emojis.cache.get('817426237395697674'));
            }
        })
    }
}

export default RuleSixListerner;