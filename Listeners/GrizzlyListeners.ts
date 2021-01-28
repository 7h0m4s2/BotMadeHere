import BotManager from "../BotManager";

class GrizzlyListerner {

    constructor() {
        BotManager.client.on('message', (msg) => {
            if(msg.content.includes('grizzly') || msg.content.includes('Grizzly')) {
                msg.react(BotManager.client.emojis.cache.get('799679747726245938'));
            }
        })
    }
}

export default GrizzlyListerner;