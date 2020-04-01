import { DatabaseInterceptor } from './DatabaseInterceptor';
import { DatabaseException } from '../database/DbConnection';
import { User, UserInteraction, Context } from '../database/entities/User';
import { DbInteraction } from '../database/interactions/DbInteraction';
import {
    NlpResponse,
    NlpContext,
    Response,
    generateId,
    logger,
    createResponse,
} from '@emundo/emubot';
import * as moment from 'moment';

/**
 * An interceptor that saves the user data to a postgres database. This data includes
 * conversation contexts from the bot.
 */
export class SaveUserDatabaseInterceptor extends DatabaseInterceptor<
    NlpResponse
> {
    private userRepository: DbInteraction<User> | undefined;

    constructor() {
        super();
        try {
        } catch (error) {
            logger.error('Database not connected, Repository not found.');
            throw error;
        }
    }

    public static async getInstance(): Promise<SaveUserDatabaseInterceptor> {
        const interceptor: SaveUserDatabaseInterceptor = new SaveUserDatabaseInterceptor();
        try {
            await interceptor.dbConnection.connect();
            interceptor.userRepository = new DbInteraction(
                interceptor.dbConnection.getRepository(User),
                User,
            );
        } catch (error) {
            logger.error(`Database not connected, Reason: ${error.message}`);
            throw new DatabaseException(
                `Interceptor could not be initialized. Reason: ${error.message}`,
            );
        }

        return interceptor;
    }

    protected whatToSave(userId: string, message: NlpResponse): User[] {
        const user: User = new User(userId);
        const context: NlpContext[] | undefined =
            message.textRequestResult.contexts;
        if (context !== undefined) {
            const id: string = generateId();
            const userInteraction = new UserInteraction(id);
            userInteraction.user = user;
            userInteraction.agentName = message.agentName;
            userInteraction.lastInteraction = moment().unix();
            const contexts = context.map((nlpContext: NlpContext) => {
                const id = generateId();
                const con = Context.fromNlpContext(id, nlpContext);
                con.interaction = userInteraction;
                con.lifespan = nlpContext.lifespan;
                con.name = nlpContext.name;

                return con;
            });
            userInteraction.contexts = contexts;
            user.userInteractions = [userInteraction];
        }

        return [user];
    }

    // In this example we simply want to save every interaction.
    protected whenToSave(_: NlpResponse): boolean {
        return true;
    }

    protected respond(
        message: NlpResponse,
        userId: string,
    ): Response<NlpResponse> {
        return createResponse(message, 200, userId);
    }

    protected async saveEntity(entity: User): Promise<void> {
        if (this.userRepository === undefined) {
            logger.error('Database not connected, Repository not found.');

            return;
        }

        await this.userRepository.updateEntity(entity.id, Object(entity));
    }
}
