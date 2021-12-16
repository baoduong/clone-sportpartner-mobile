import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AppConfig } from 'src/app/app.config';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ACTION_GET_LATEST_GROUP_MESSAGE } from 'src/app/const.actions';
import { map, filter, first } from 'rxjs/operators';


@Injectable({
    providedIn: 'root',
})

export class LatestMessageResolver implements Resolve<any> {

    constructor(
        private appConfig: AppConfig,
        private store: Store<{ groupReducer: any }>
    ) {}

    resolve(): Observable<any> {
        this.store.dispatch({
            type : ACTION_GET_LATEST_GROUP_MESSAGE,
            payload: {
              pageSize: 3,
              languageCode: this.appConfig.config.language,
              countryCode: this.appConfig.config.country
            }
        });
        return this.getLatestMessageGroup();
    }

    getLatestMessageGroup() {
        return this.store.pipe(
          select(state => state.groupReducer),
          map(loader => loader.latestGroupMessage),
          filter(loader => loader),
          first()
        );
    }
}
