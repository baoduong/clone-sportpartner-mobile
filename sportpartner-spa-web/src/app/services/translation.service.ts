import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslationService {

  appConfig: AppConfig;

  constructor(private httpClient: HttpClient) { }

  getTranslation(lang) {
    // console.log('[Get translation Lang:]', lang);
    // if (environment.production) {
    return this.httpClient.get(`${environment.apiGateway}/v1/configuration/Translation/get-translation/${lang}`);
    // } else {
    //   return this.httpClient.get('/spa-web/assets/sportpartner_en.json').pipe(
    //     map(data => ({ result: JSON.stringify(data) }))
    //   );
    // }
  }
}
