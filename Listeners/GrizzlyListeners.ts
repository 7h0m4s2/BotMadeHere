import BotManager from "../BotManager";

class GrizzlyListerner {

    constructor() {
        BotManager.client.on('message', (msg) => {
            if(msg.content.includes('grizzly')) {
                msg.react(":grizzlyfounderceoenhance:");
            }
        })
    }
}

export default GrizzlyListerner;