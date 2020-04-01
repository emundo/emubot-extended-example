import { User } from '../database/entities/User';
import { databasePostgresConfig } from '../configuration/databasePostgresConfig';
import { DbInteraction } from '../database/interactions/DbInteraction';
import { DbConnection, DatabaseException } from '../database/DbConnection';
import { PseudonymizationInterceptor } from './PseudonymizationInterceptor';

import {
    ChatAdapterRequest,
    createResponse,
    Response,
    logger,
} from '@emundo/emubot';

/**
 *
 * @param userId Real non-pseudonymized user ID
 * @param userRepository Database access
 *
 * Transforms the user ID to the pseudonymized user ID.
 */
async function pseudonymizeUser(
    userId: string,
    userRepository: DbInteraction<User>,
): Promise<string> {
    const user: User = await userRepository.findOrCreate(userId);

    return user.pseudonymizedId;
}

/**
 * A concrete implementation of the `PseudonymizationInterceptor` as a chat-to-core
 * interceptor. The implementation exchanges the user IDs with an randomly created
 * pseudo user ID and saves both IDs in a database.
 */
export class DatabasepseudonymizationInterceptor extends PseudonymizationInterceptor<
    ChatAdapterRequest
> {
    public userRepository!: DbInteraction<User>;

    public dbConnection: DbConnection;

    public constructor() {
        super(pseudonymizeUser);
        try {
            this.dbConnection = new DbConnection(databasePostgresConfig);
        } catch (error) {
            logger.error(
                `DatabasepseudonymizationInterceptor: Database not connected, Reason: ${error.message}`,
            );
            throw error;
        }
    }

    public static async getInstance(): Promise<
        DatabasepseudonymizationInterceptor
    > {
        const interceptor: DatabasepseudonymizationInterceptor = new DatabasepseudonymizationInterceptor();
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

    async handleMessage(
        userId: string,
        request: ChatAdapterRequest,
    ): Promise<Response<ChatAdapterRequest>> {
        /*
         * Send the user contexts, fetched from the database, to the NLU.
         * If the user does not exist as of yet create a database entry.
         */
        const user: User = await this.userRepository.findOrCreate(userId);
        const pseudonymizedId = await this.transformFunction(
            user.id,
            this.userRepository,
        );

        return createResponse(request, 200, pseudonymizedId);
    }
}
