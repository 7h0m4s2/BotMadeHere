import BotManager from "../BotManager";
import { QuestionPollMessage } from "../entity/QuestionPollMessage";

class PollVoteListerner {

    constructor() {
        BotManager.client.on('messageReactionAdd', async (reaction, user) => {
           if(reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    console.error('Something went wrong when fetching the message: ', error);
                    // Return as `reaction.message.author` may be undefined/null
                    return;
                }
           }

           const pollMessage = await BotManager.database.connection
                .getRepository(QuestionPollMessage)
                .createQueryBuilder("pollmessage")
                .leftJoinAndSelect("pollmessage.question", "question")
                .leftJoinAndSelect("question.questionsession", "questionsession")
                .where("pollmessage.messageId = :id", { id: reaction.message.id })
                .getOne();

            if(pollMessage) {
                if(pollMessage.question.questionsession.pollactive) {
                    if(reaction.emoji.name !== '⬆️') {
                        reaction.remove();
                    }
    
                    const question = pollMessage.question;
                    question.votes = reaction.count - 1;
                    BotManager.database.connection.manager.save(question);
    
               }
            }

           
        });

        BotManager.client.on('messageReactionRemove', async (reaction, user) => {
            if(reaction.partial) {
                 try {
                     await reaction.fetch();
                 } catch (error) {
                     console.error('Something went wrong when fetching the message: ', error);
                     // Return as `reaction.message.author` may be undefined/null
                     return;
                 }
            }
 
            const pollMessage = await BotManager.database.connection
                 .getRepository(QuestionPollMessage)
                 .createQueryBuilder("pollmessage")
                 .leftJoinAndSelect("pollmessage.question", "question")
                 .leftJoinAndSelect("question.questionsession", "questionsession")
                 .where("pollmessage.messageId = :id", { id: reaction.message.id })
                 .getOne();
 
             if(pollMessage) {
                 if(pollMessage.question.questionsession.pollactive) {
                     const question = pollMessage.question;
                     question.votes = reaction.count - 1;
                     BotManager.database.connection.manager.save(question);
                }
             }
 
            
         })
    }
}

export default PollVoteListerner;