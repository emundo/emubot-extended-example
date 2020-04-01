import { PauseBotInterceptor } from './PauseBotInterceptor';
import { DbConnection, DatabaseException } from '../database/DbConnection';
import { User } from '../database/entities/User';
import { DbInteraction } from '../database/interactions/DbInteraction';
import { databasePostgresConfig } from '../configuration/databasePostgresConfig';
import { logger } from '@emundo/emubot';
import { NlpResponse } from '@emundo/emubot';

/**
 * Interceptor that pauses when the bot answers with a fallback intent. The conversation
 * is then paused until the bot answers with an answer that has the "unpause" action.
 * This could be useful if you want to start a conversation with a person when the bot did
 * not understand the user correctly.
 */
export class NlpControlledPauseInterceptor extends PauseBotInterceptor<
    NlpResponse
> {
    protected dbConnection: DbConnection;

    protected userRepository: DbInteraction<User> | undefined;

    constructor() {
        super();
        this.dbConnection = new DbConnection(databasePostgresConfig);
    }

    public static async getInstance(): Promise<NlpControlledPauseInterceptor> {
        const interceptor: NlpControlledPauseInterceptor = new NlpControlledPauseInterceptor();
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

    protected async botShouldBePaused(message: NlpResponse): Promise<boolean> {
        return message.textRequestResult.isFallbackIntent;
    }

    protected async botShouldBeUnpaused(
        message: NlpResponse,
    ): Promise<boolean> {
        return message.textRequestResult.action == 'unpause';
    }

    protected async pause(userId: string): Promise<void> {
        this.switchAndSave(userId);
    }

    protected async unpause(userId: string): Promise<void> {
        this.switchAndSave(userId);
    }

    private async switchAndSave(userId: string): Promise<void> {
        if (this.userRepository === undefined) {
            logger.error('Database not connected, Repository not found.');

            return;
        }

        const user: User = await this.userRepository.findOrCreate(userId);
        user.wantsToInteractWithBot = !user.wantsToInteractWithBot;

        return await this.userRepository.saveEntity(user);
    }
}
