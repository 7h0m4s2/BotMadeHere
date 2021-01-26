import { Message, User } from "discord.js";
import BotManager from "../BotManager";
import BotCommand from "./BotCommand";

const ytnotifier = require('youtube-notifier');

class NotifyYoutube extends BotCommand {
    command = 'notify youtube';

    constructor() {
        super();

        this.initYoutubeChecker();
    }

    async commandHandler(msg: Message) {
        msg.react('✅');
        if(await this.toggleNotifyUser()) {
            msg.author.send('You have been added to the SMH Discord notify list. You can send "'+this.getPrefix() + this.command+'" here at any time to disable the YouTube notify message');
        } else {
            msg.author.send('You have been removed from the SMH Discord notify list. You can send "'+this.getPrefix() + this.command+'" here at any time to enable the YouTube notify message');
        }
    }

    async toggleNotifyUser() {

        this.user.enableYoutube = !this.user.enableYoutube;

        BotManager.database.connection.manager.save(this.user);
        return this.user.enableYoutube;
    }

    initYoutubeChecker() {
        const Notifier = new ytnotifier({
            channels: ['UCDmnvYfcAz3lvZfSQommNEQ'],
            checkInterval: 50
        });

        Notifier.on('video', video => {
            this.sendAllUsersNotification(video);
            console.log(video);
        });
    }

    async sendAllUsersNotification(video: any) {
        const Users = await BotManager.database.getUsersYoutube();
        
        for (const user of Users) {
            const discordUser = BotManager.client.users.fetch(user.userId);
            (await discordUser).send('SMH has uploaded a new video, check it out now! ' + video.link)
        }
    }

    getHelpMessageContent() {
        return 'The ' + BotManager.config.name + ' will send you a private message when a new video is uploaded';
    }
}

export default NotifyYoutube;