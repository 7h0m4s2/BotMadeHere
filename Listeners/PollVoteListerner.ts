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
               }
            }

           
        });
    }
}

export default PollVoteListerner;