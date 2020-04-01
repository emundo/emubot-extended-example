import { DatabaseConfig } from '../database/DbConnection';

export const databasePostgresConfig: DatabaseConfig = {
    entities: [__dirname + '/../database/entities/{*.js, *.ts}'],
    host: 'localhost',
    name: 'nameOfYourDatabase',
    password: 'setThisPassword',
    port: 5432,
    type: 'postgres',
    user: 'postgres',
};
