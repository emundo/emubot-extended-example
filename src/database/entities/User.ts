import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { DbEntity } from './DbEntity';
import { NlpContext, generateId } from '@emundo/emubot';

@Entity()
export class User extends DbEntity {
    @Column()
    public pseudonymizedId: string;

    @Column()
    public userName: string;

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    @OneToMany(() => UserInteraction, userInteraction => userInteraction.user, {
        cascade: true,
    })
    public userInteractions: UserInteraction[];

    @Column()
    public wantsToInteractWithBot: boolean;

    constructor(id: string) {
        super(id);
        this.userName = '';
        this.pseudonymizedId = generateId();
        this.wantsToInteractWithBot = true;
        this.userInteractions = [];
    }

    public async update(data: {
        userName: string | undefined;
        userInteraction: UserInteraction[] | undefined;
        userContexts: Context[] | undefined;
    }): Promise<void> {
        this.userName = data.userName || this.userName;
        if (this.userInteractions !== undefined) {
            this.userInteractions = this.userInteractions.concat(
                data.userInteraction || [],
            );
            this.userInteractions.forEach(interaction =>
                interaction.update({ userContexts: data.userContexts }),
            );
        } else if (data.userInteraction !== undefined) {
            this.userInteractions = data.userInteraction;
            this.userInteractions.forEach(interaction =>
                interaction.update({ userContexts: data.userContexts }),
            );
        }
    }
}

@Entity()
export class UserInteraction extends DbEntity {
    @Column()
    public agentName!: string;

    @Column()
    public lastInteraction!: number;

    @ManyToOne(() => User, user => user.userInteractions)
    public user!: User;

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    @OneToMany(() => Context, context => context.interaction, { cascade: true })
    public contexts: Context[];

    constructor(id: string) {
        super(id);
        this.contexts = [];
    }

    public update(data: {
        agentName?: string;
        lastInteraction?: number;
        user?: User;
        userContexts?: Context[];
    }): void {
        this.agentName =
            data.agentName !== undefined ? data.agentName : this.agentName;
        this.lastInteraction =
            data.lastInteraction !== undefined
                ? data.lastInteraction
                : this.lastInteraction;
        this.user = data.user !== undefined ? data.user : this.user;
        if (data.userContexts) {
            data.userContexts.forEach(context => {
                if (data.agentName === this.agentName) {
                    (this.contexts || []).push(context);
                }
            });
        }
    }
}

@Entity()
export class Context extends DbEntity {
    @Column()
    public name!: string;

    @Column()
    public lifespan!: number;

    @ManyToOne(() => UserInteraction, interaction => interaction.contexts)
    public interaction!: UserInteraction;

    constructor(id: string) {
        super(id);
    }

    public static fromNlpContext(id: string, nlpContext: NlpContext): Context {
        const context: Context = new Context(id);
        context.lifespan = nlpContext.lifespan;
        context.name = nlpContext.name;

        return context;
    }

    public update(data: {
        context?: string;
        lifespan?: number;
        interaction?: UserInteraction;
    }): void {
        this.name = data.context !== undefined ? data.context : this.name;
        this.lifespan =
            data.lifespan !== undefined ? data.lifespan : this.lifespan;
        this.interaction =
            data.interaction !== undefined
                ? data.interaction
                : this.interaction;
    }
}
