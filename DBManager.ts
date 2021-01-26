import BotManager from "./BotManager";
import {createConnection, Connection, getConnection, getRepository} from "typeorm";

import {User} from "./entity/User";
import { UserNotify } from "./entity/UserNotify";

class DBManager {

    connection: Connection;

    constructor() {
       this.createConnection();
    }

    async createConnection() {
        this.connection = await createConnection({
            type: "mysql",
            host: BotManager.config.db_host,
            port: 3306,
            username: BotManager.config.db_user,
            password: BotManager.config.db_pass,
            database: BotManager.config.db_name,
            entities: [
                User,
                UserNotify
            ],
            synchronize: true,
        });
    }

    async getUser(userId) {
        return await this.connection.getRepository(User).findOne({userId: userId});
    }
}

export default DBManager