import BotManager from "../BotManager";

class GarbageListerner {

    constructor() {
        BotManager.client.on('message', (msg) => {
            if(msg.content.includes('garbage') || msg.content.includes('Garbage')) {
                msg.react(BotManager.client.emojis.cache.get('812126517916205066'));
            }
        })
    }
}

export default GarbageListerner;