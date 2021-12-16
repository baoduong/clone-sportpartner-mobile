import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export class DBMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    return params.key;
  }
}
