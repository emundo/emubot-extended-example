import { DbConnection } from '../database/DbConnection';
import { databasePostgresConfig } from '../configuration/databasePostgresConfig';
import { DbEntity } from '../database/entities/DbEntity';
import { Response, Interceptor } from '@emundo/emubot';

/**
 * Generic example of an Interceptor that saves some data to a database.
 */
export abstract class DatabaseInterceptor<T> implements Interceptor<T, T> {
    protected dbConnection: DbConnection;

    protected constructor() {
        this.dbConnection = new DbConnection(databasePostgresConfig);
    }

    public async handleMessage(
        userId: string,
        message: T,
    ): Promise<Response<T>> {
        if (this.whenToSave(message)) {
            const dbEntity: DbEntity[] = this.whatToSave(userId, message);
            dbEntity.forEach(
                async (entity: DbEntity) => await this.saveEntity(entity),
            );
        }

        return this.respond(message, userId);
    }

    protected abstract whatToSave(userId: string, message: T): DbEntity[];

    protected abstract whenToSave(message: T): boolean;

    protected abstract respond(message: T, userId: string): Response<T>;

    protected abstract async saveEntity(entity: DbEntity): Promise<void>;
}
