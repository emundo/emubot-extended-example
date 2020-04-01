import { FacebookAdapter } from '@emundo/emubot';
import { FacebookChatConfig } from '@emundo/emubot';

export const platformChatFacebook: FacebookChatConfig = {
    appSecret: 'YOUR_APP_SECRET',
    constructor: FacebookAdapter,
    name: 'facebook',
    pageAccessToken: 'YOUR_PAGE_ACCESS_TOKEN',
    url: 'https://graph.facebook.com/',
    verifyToken: 'YOUR_VERIFY_TOKEN',
    version: 'v3.3',
    webhook_path: '/webhook',
};
