import {
    ChatAdapter,
    Adapter,
    BotFrameworkInterfaceMessage,
    Response,
    ChatAdapterResponse,
    Interceptor,
    adapter,
    createResponse,
    createNoResponse,
    textToResponse,
    logger,
} from '@emundo/emubot';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * This reminder can be used to send reminders to a user.
 */
export abstract class ReminderInterceptor<
    T extends BotFrameworkInterfaceMessage
> implements Interceptor<T, T> {
    protected chatAdapter: ChatAdapter;

    protected constructor() {
        this.chatAdapter = adapter.chat;
    }

    public static async getInstance(
        _: Adapter,
    ): Promise<ReminderInterceptor<BotFrameworkInterfaceMessage>> {
        throw Error('Not implemented.');
    }

    public handleMessage(userId: string, message: T): Promise<Response<T>> {
        logger.verbose(`Checking whether to send reminder to ${userId}`);
        if (this.sendReminderWhen(message)) {
            logger.verbose(`Send reminder to ${userId}`);
            this.sendReminder(userId, message);

            return Promise.resolve(createNoResponse(204, userId));
        }
        console.log('no need to send reminder');

        return Promise.resolve(createResponse(message, 200, userId));
    }

    protected async sendReminder(userId: string, message: T): Promise<void> {
        const period = this.getReminderTiming(message);
        const text = this.getReminderMessage(message);
        const user = this.whomToRemind(userId, message);
        logger.verbose(
            `I will remind ${user} every ${period} ms with the message ${text}`,
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whenToStop: (data: any) => boolean = this.whenToStop(message);
        while (!whenToStop(undefined)) {
            await sleep(period);
            const response: ChatAdapterResponse =
                text === ''
                    ? textToResponse('Generic reminder!', userId)
                    : textToResponse(text, userId);
            await this.chatAdapter.contactClient(response);
        }
    }

    protected abstract getReminderMessage(
        message: BotFrameworkInterfaceMessage,
    ): string;

    protected abstract sendReminderWhen(
        message: BotFrameworkInterfaceMessage,
    ): boolean;

    protected abstract getReminderTiming(
        message: BotFrameworkInterfaceMessage,
    ): number;

    protected abstract whenToStop(
        message: BotFrameworkInterfaceMessage,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): (data: any) => boolean;

    protected abstract whomToRemind(
        userId: string,
        message: BotFrameworkInterfaceMessage,
    ): string;
}
