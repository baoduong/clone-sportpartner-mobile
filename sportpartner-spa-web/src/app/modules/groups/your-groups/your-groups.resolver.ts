import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppConfig } from 'src/app/app.config';
import { getAllYourGroup } from '../store/group.actions';
import { map, filter, first } from 'rxjs/operators';
import { GroupDetailModel } from 'src/models/group-detail.model';

@Injectable({
    providedIn: 'root',
})

export class YourGroupsResolver implements Resolve<GroupDetailModel[]> {

    constructor(
        private store: Store<{ groupReducer: any }>,
        private appConfig: AppConfig,
    ) { }

    resolve(): Observable<GroupDetailModel[]> | Observable<any> {
        this.store.dispatch(getAllYourGroup({
            payload: {
                culture: this.appConfig.config.culture,
                languageCode: this.appConfig.config.language,
            }
        })
        );

        return this.getAllYourGroup();
    }

    getAllYourGroup(): Observable<any> {
        return this.store.pipe(
            select(state$ => {
                // console.log('state data your group', state$);
                return state$.groupReducer;
            }),
            map(loaded => loaded.yourGroup),
            filter(loaded => loaded),
            first()
        );
    }
}
