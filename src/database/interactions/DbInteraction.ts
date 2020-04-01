import { Repository } from 'typeorm';
import { DbEntity } from '../entities/DbEntity';

export class DbInteraction<Entity extends DbEntity> {
    public repository: Repository<Entity>;

    constructor(
        repository: Repository<Entity>,
        private testType: new (id: string) => Entity,
    ) {
        this.repository = repository;
    }

    public getNew(id: string): Entity {
        return new this.testType(id);
    }

    public async checkExistenceById(id: string): Promise<boolean> {
        return (await this.repository.findByIds([id])).length !== 0;
    }

    public async getById(_id: string): Promise<Entity> {
        return this.repository.findOneOrFail(_id);
    }

    public async findOrCreate(id: string, entity?: Entity): Promise<Entity> {
        if (await this.checkExistenceById(id)) {
            return this.getById(id);
        }
        if (entity !== undefined) {
            return this.create(entity);
        } else {
            const entity = this.getNew(id);

            return this.create(entity);
        }
    }

    public async create(entity: Entity): Promise<Entity> {
        this.doCreate(entity);

        return await this.doSave(entity);
    }

    public async deleteById(id: string): Promise<void> {
        this.repository.remove(await this.getById(id));
    }

    public async updateEntity(
        id: string,
        data: { [key: string]: unknown },
    ): Promise<void> {
        const entity: Entity = await this.getById(id);
        entity.update(data);
        this.doSave(entity);
    }

    public async saveEntity(entity: Entity): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.repository.save(entity as any);
    }

    private doCreate(entity: Entity): void {
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.repository.create(entity as any);
    }

    private doSave(entity: Entity): Promise<Entity> {
        // https://github.com/typeorm/typeorm/issues/2904
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.repository.save(entity as any);
    }
}
