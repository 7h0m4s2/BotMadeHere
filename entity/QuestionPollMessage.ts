import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { Question } from "./Question";

@Entity()
export class QuestionPollMessage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    messageId: string

    @Column()
    channelId: string

    @OneToOne(() => Question)
    @JoinColumn()
    question: Question;
}