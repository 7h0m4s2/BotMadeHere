import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from './User';

export enum Notifiers {
    YOUTUBE = "youtube",
    PATREON = "patreon",
}

@Entity()
export class UserNotify {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @Column({
        type: "enum",
        enum: Notifiers,
    })
    role: Notifiers

    constructor(user: User, notifier: Notifiers) {
        this.user = user;
        this.role = notifier;
    }
}