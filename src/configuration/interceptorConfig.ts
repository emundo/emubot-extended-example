import { InterceptorConfig, MirrorInterceptor } from '@emundo/emubot';
import { DatabasepseudonymizationInterceptor } from '../interceptors/DatabasePseudonymizationInterceptor';
import { DatabaseDepseudonymizationInterceptor } from '../interceptors/DatabaseDepseudonymizationInterceptor';

export const interceptorConfig: InterceptorConfig = {
    chatToCore: DatabasepseudonymizationInterceptor.getInstance,
    nlpToNlp: MirrorInterceptor.getInstance,
    nlpToCore: DatabaseDepseudonymizationInterceptor.getInstance,
};
