import 'reflect-metadata';
import { Connection } from 'typeorm';
import { logger } from '@emundo/emubot';

export class DatabaseException extends Error {}

export type DatabaseConfig = {
    host: string;
    port: number;
    name: string;
    password: string;
    user: string;
    entities: [string]; // Directory of the entities
    type: 'postgres';
};
export class DbConnectionException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class DbConnection extends Connection {
    public constructor(databaseConfig: DatabaseConfig, synchronize = true) {
        super({
            database: databaseConfig.name,
            entities: databaseConfig.entities,
            host: databaseConfig.host,
            password: databaseConfig.password,
            port: databaseConfig.port,
            synchronize: synchronize,
            type: databaseConfig.type,
            username: databaseConfig.user,
        });
    }

    public async init(): Promise<void> {
        try {
            const connection = await this.connect();
            if (connection === undefined) {
                throw new DbConnectionException('Connection undefined');
            }
        } catch (error) {
            logger.error('Failed to connect to database.');
        }
    }
}
