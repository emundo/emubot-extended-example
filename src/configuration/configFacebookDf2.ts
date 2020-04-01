import { Config } from '@emundo/emubot';
import { FacebookAdapter } from '@emundo/emubot';
import { DialogflowV2Adapter } from '@emundo/emubot';
import { platformChatFacebook } from './platformChatFacebook';
import { platformNlpDialogflowV2 } from './platformNlpDialogflowV2';
import { serverConfig } from './serverConfig';
import { interceptorConfig } from './interceptorConfig';

export const config: Config<FacebookAdapter, DialogflowV2Adapter> = {
    interceptors: interceptorConfig,
    platform: {
        chat: platformChatFacebook,
        nlp: platformNlpDialogflowV2,
    },
    server: serverConfig,
};
