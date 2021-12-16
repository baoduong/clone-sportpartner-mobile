import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';
import * as GroupActions from '../store/group.actions';

@Injectable({ providedIn: 'root' })
export class DiscoveredGroupIdsResolver implements Resolve<any> {

    constructor(private store: Store<{ groupReducer: any }>) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        this.store.dispatch(GroupActions.getDiscoveredGroupIds());

        return this.getIds();
    }

    getIds(): Observable<any> {
        return this.store.pipe(
            select(state => state.groupReducer),
            map(loaded => loaded.discoverGroupIds),
            filter(loaded => loaded),
            first()
        );
    }
}
