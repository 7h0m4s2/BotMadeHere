import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany} from "typeorm";
import { Question } from "./Question";

@Entity()
export class QuestionSession {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created: string;

    @Column({ type: "timestamp", nullable: true, default: ( ) => 'null'})
    closed: string;

    @Column('boolean', {default: false})
    active: boolean;

    @Column('boolean', {default: false})
    pollactive: boolean;

    @OneToMany(() => Question, question => question.questionsession)
    questions: Question[];
}