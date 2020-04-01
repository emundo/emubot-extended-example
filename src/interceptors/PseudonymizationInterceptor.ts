import {
    BotFrameworkInterfaceMessage,
    Response,
    createResponse,
    Interceptor,
} from '@emundo/emubot';

/**
 * An interceptor that changes user IDs between certain points in the framework.
 *
 * Usually, users of messenging services can be identified by a fixed user identifier that can also be used
 * to obtain more information (e.g. public/private profile information) about the user.
 * Since the identifiers often follow a predefined structure, it might be desirable to change the identifier
 * to avoid leakage about users to other services.
 */
export class PseudonymizationInterceptor<T extends BotFrameworkInterfaceMessage>
    implements Interceptor<T, T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transformFunction: (req: string, ...args: any) => Promise<string>;

    constructor(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformFunction: (userId: string, ...args: any) => Promise<string>,
    ) {
        this.transformFunction = transformFunction;
    }

    public async handleMessage(
        userId: string,
        message: T,
        _isScoreGoodEnough?: boolean,
    ): Promise<Response<T>> {
        const pesudomizedId: string = await this.transformFunction(userId);

        return createResponse(message, 200, pesudomizedId);
    }
}
