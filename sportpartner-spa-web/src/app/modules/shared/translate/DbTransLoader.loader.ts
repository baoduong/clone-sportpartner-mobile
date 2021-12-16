import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { TranslationService } from 'src/app/services/translation.service';

export class DbTranslateLoader implements TranslateLoader {
  constructor(private translationService: TranslationService) { }

  // REAL: CALL API
  getTranslation(lang: string): Observable<any> {
    return this.translationService.getTranslation(lang).pipe(
      map(value => {
        const allContentslang = JSON.parse(value['result']);

        if (allContentslang !== null) {
          const language = JSON.parse(JSON.stringify(allContentslang).replace(/##~/g, ''));
          return language;
        } else {
          return {};
        }
      })
    );
    // return of({ KEY: 'value' });
  }
}

// https://github.com/ngx-translate/core#3-init-the-translateservice-for-your-application
