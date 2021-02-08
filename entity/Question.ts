import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { QuestionSession } from "./QuestionSession";
import {User} from './User';

@Entity()
export class Question {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({type: "int", default: () => 0})
    votes: number

    @Column()
    guildId: string

    @Column()
    channelId: string

    @Column()
    messageId: string

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    added: string;

    @ManyToOne(() => User, user => user.questions)
    user: User;

    @ManyToOne(() => QuestionSession, questionSession => questionSession.questions)
    questionsession: QuestionSession;
}