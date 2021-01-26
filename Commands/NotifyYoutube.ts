import { Message, User } from "discord.js";
import BotManager from "../BotManager";
import BotCommand from "./BotCommand";
import { Notifiers, UserNotify } from '../entity/UserNotify';
import { throws } from "assert";

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
        const setUser = await BotManager.database.connection.getRepository(UserNotify).findOne({ user: this.user});

        if(setUser === undefined) {
            const userNotify = new UserNotify(this.user, Notifiers.YOUTUBE);
            BotManager.database.connection.manager.save(userNotify);
            this.sendAllUsersNotification();

            return true;
        } else {
            BotManager.database.connection.getRepository(UserNotify).remove(setUser);
            this.sendAllUsersNotification();

            return false;
        }

    }

    initYoutubeChecker() {
        const Notifier = new ytnotifier({
            channels: ['UCDmnvYfcAz3lvZfSQommNEQ'],
            checkInterval: 50
        });

        Notifier.on('video', video => {
            this.sendAllUsersNotification();
            console.log(video);
        });
    }

    async sendAllUsersNotification() {
        const users = await BotManager.database.connection.manager.find(UserNotify, {role: Notifiers.YOUTUBE});
        console.log(users);
    }

    getHelpMessageContent() {
        return 'The ' + BotManager.config.name + ' will send you a private message when a new video is uploaded';
    }
}

export default NotifyYoutube;