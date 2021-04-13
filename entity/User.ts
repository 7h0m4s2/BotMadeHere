import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Question } from "./Question";

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

    @OneToMany(() => Question, question => question.user)
    questions: Question[];

    constructor(id: string, username: string, bot: boolean) {
        this.userId = id;
        this.username = (username) ? username.replace(/[\u0800-\uFFFF]/g, '') : '';
        this.bot = bot;
        this.enablePatreon = false;
        this.enableYoutube = false;
    }

}