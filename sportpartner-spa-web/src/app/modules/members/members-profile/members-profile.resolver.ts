import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { Observable, of } from 'rxjs';
import { map, filter, first, debounceTime } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as MemberActions from '../members.actions';

@Injectable({
    providedIn: 'root',
})

export class MemberProfileResolver implements Resolve<MemberProfileModel> {

    constructor(
        private store: Store<{ profileReducer: any }>
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<MemberProfileModel> | Observable<any> {
        this.store.dispatch(MemberActions.getMemberProfile({payload: route.params}));
        return this.getMemberProfile();
    }

    getMemberProfile(): Observable<any> {
        return this.store
            .pipe(
                select(state => state.profileReducer),
                map(loaded => loaded.memberProfile),
                filter(loaded => !!loaded),
                first()
            );
    }
}
