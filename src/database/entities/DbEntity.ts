import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export abstract class DbEntity {
    @PrimaryColumn()
    public id!: string;

    constructor(id: string) {
        this.id = id;
    }

    public create<T>(type: new () => T): T {
        return new type();
    }

    public abstract update(data: { [key: string]: unknown }): void;
}
