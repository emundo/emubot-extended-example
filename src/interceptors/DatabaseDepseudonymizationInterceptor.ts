import { User } from '../database/entities/User';
import { databasePostgresConfig } from '../configuration/databasePostgresConfig';
import { DbInteraction } from '../database/interactions/DbInteraction';
import { DbConnection, DatabaseException } from '../database/DbConnection';
import { PseudonymizationInterceptor } from './PseudonymizationInterceptor';
import { Response, createResponse, NlpResponse, logger } from '@emundo/emubot';

/**
 *
 * @param pseudonymizedUserId The pseudonymized user ID of the user
 * @param userRepository Database access
 *
 * Searches the database for the user with the pseudonymized user ID and returns the
 * depseudonymized user ID.
 */
async function depseudonymizeUser(
    pseudonymizedUserId: string,
    userRepository: DbInteraction<User>,
): Promise<string> {
    const user: User | undefined = await userRepository.repository
        .createQueryBuilder('user')
        .where('user.pseudonymizedId = :id', { id: pseudonymizedUserId })
        .getOne();
    if (user === undefined) {
        logger.error(
            `No User was found for pseudonymized ID ${pseudonymizedUserId}.`,
        );
        throw new Error(
            `No User was found for pseudonymized ID ${pseudonymizedUserId}`,
        );
    }

    return user.id;
}

/**
 * Concrete implementation of the `PseudonymizationInterceptor` as an NLP-to-Core
 * interceptor. The implementation reads the depseudonymized user id from a database
 * and resets the currently pseudonymized user ID back to the depseudonymized ID.
 */
export class DatabaseDepseudonymizationInterceptor extends PseudonymizationInterceptor<
    NlpResponse
> {
    public userRepository!: DbInteraction<User>;

    public dbConnection: DbConnection;

    public constructor() {
        super(depseudonymizeUser);
        try {
            this.dbConnection = new DbConnection(databasePostgresConfig);
        } catch (error) {
            logger.error(
                `DatabaseDepseudonymizationInterceptor: Database not connected, Reason: ${error.message}`,
            );
            throw error;
        }
    }

    public static async getInstance(): Promise<
        DatabaseDepseudonymizationInterceptor
    > {
        const interceptor: DatabaseDepseudonymizationInterceptor = new DatabaseDepseudonymizationInterceptor();
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
        pseudonymizedUserId: string,
        request: NlpResponse,
    ): Promise<Response<NlpResponse>> {
        /*
         * Send the user contexts, fetched from the database, to the NLU.
         * If the user does not exist as of yet create a database entry.
         */
        const userId: string = await this.transformFunction(
            pseudonymizedUserId,
            this.userRepository,
        );

        return createResponse(request, 200, userId);
    }
}
