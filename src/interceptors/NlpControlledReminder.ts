import { ReminderInterceptor } from './ReminderInterceptor';
import { NlpResponse, NlpMessage, NlpParameters } from '@emundo/emubot';
import * as moment from 'moment';

/**
 * This Interceptor creates a reminder that is send to the user based on some parameter
 * that are parsed from the NLP response. It is expected that the agent answers with the
 * parameters 'period' which is a timespan after which the reminder should be sent and
 * and the action 'reminder' is set.
 */
export class NlpControlledReminder extends ReminderInterceptor<NlpResponse> {
    public static getInstance(): Promise<NlpControlledReminder> {
        return Promise.resolve(new NlpControlledReminder());
    }

    protected getReminderMessage(message: NlpResponse): string {
        const nlpMessage: NlpMessage[] = message.textRequestResult.message;
        for (const resp of nlpMessage) {
            if (resp.type === 'text') {
                return resp.text;
            }
        }

        return '';
    }

    protected sendReminderWhen(message: NlpResponse): boolean {
        const action: string = message.textRequestResult.action || '';

        return action.includes('reminder');
    }

    protected getReminderTiming(message: NlpResponse): number {
        const params: NlpParameters | undefined =
            message.textRequestResult.parameters;
        if (params !== undefined) {
            // predefined period
            return (params.period as number) * 1000 || 10000;
        }

        return -1;
    }

    protected whenToStop(message: NlpResponse): () => boolean {
        const params: NlpParameters | undefined =
            message.textRequestResult.parameters;
        const period: number = this.getReminderTiming(message);
        if (params !== undefined) {
            const dateString: string = (params.date as string) || '';
            const stopDate: moment.Moment =
                dateString === ''
                    ? moment().add(period / 1000, 'seconds')
                    : moment(dateString);

            return () => moment() > stopDate;
        }

        return () => false;
    }

    protected whomToRemind(userId: string, message: NlpResponse): string {
        const params: NlpParameters | undefined =
            message.textRequestResult.parameters;
        if (params !== undefined) {
            if (params.who !== undefined) {
                // who to remind
                return params.who as string;
            } else {
                return userId;
            }
        }

        return userId;
    }
}
