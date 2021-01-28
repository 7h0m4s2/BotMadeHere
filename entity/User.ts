import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "bigint"})
    userId: string

    @Column()
    username: string;

    @Column()
    bot: boolean;

    @Column('boolean', {default: false})
    enableYoutube: boolean;

    @Column('boolean', {default: false})
    enablePatreon: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    added: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    lastSend: string;

    constructor(id: string, username: string, bot: boolean) {
        this.userId = id;
        this.username = username;
        this.bot = bot;
        this.enablePatreon = false;
        this.enableYoutube = false;
    }

}