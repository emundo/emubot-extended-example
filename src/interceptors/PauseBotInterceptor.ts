import {
    BotFrameworkInterfaceMessage,
    Response,
    Interceptor,
} from '@emundo/emubot';
import { createResponse, createNoResponse, logger } from '@emundo/emubot';

/**
 * An abstract interceptor that pauses and unpauses the conversation with the bot under
 * certain to yet be defined circumstances (perhaps time based or in the case of
 * misunderstandings).
 */
export abstract class PauseBotInterceptor<
    T extends BotFrameworkInterfaceMessage
> implements Interceptor<T, T> {
    public static async getInstance(): Promise<
        PauseBotInterceptor<BotFrameworkInterfaceMessage>
    > {
        throw Error('Not implemented.');
    }

    public async handleMessage(
        userId: string,
        message: T,
    ): Promise<Response<T>> {
        if (this.botShouldBePaused(message)) {
            logger.verbose(`Bot will be paused for ${userId}`);
            this.pause(userId);

            return createNoResponse(200, userId);
        } else if (this.botShouldBeUnpaused(message)) {
            logger.verbose(`Bot will be unpaused for ${userId}`);
            this.unpause(userId);
        }

        return createResponse(message, 200, userId);
    }

    protected abstract botShouldBePaused(
        message: BotFrameworkInterfaceMessage,
    ): Promise<boolean>;

    protected abstract botShouldBeUnpaused(
        message: BotFrameworkInterfaceMessage,
    ): Promise<boolean>;

    protected abstract pause(userId: string): Promise<void>;

    protected abstract unpause(userId: string): Promise<void>;
}
