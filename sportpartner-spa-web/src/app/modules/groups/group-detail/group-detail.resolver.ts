import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GroupDetailModel } from 'src/models/group-detail.model';

import { filter, first, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { ACTION_GET_GROUP_DETAIL } from 'src/app/const.actions';
import { AppConfig } from 'src/app/app.config';

@Injectable({ providedIn: 'root' })
export class GroupDetailResolver implements Resolve<GroupDetailModel> {

  constructor(private store: Store<{ groupReducer: any }>, private appConfig: AppConfig) { }


  resolve(route: ActivatedRouteSnapshot): Observable<GroupDetailModel> | Observable<any> {
    this.store.dispatch({
      type: ACTION_GET_GROUP_DETAIL,
      payload: {
        urlPathSport: route.params.sport,
        urlPathCity: route.params.city,
        languageCode: this.appConfig.config.language
      }
    });
    return this.getGroupDetail(route);
  }

  getGroupDetail(route): Observable<any> {
    // this.store.dispatch({ type: ACTION_GET_GROUP_DETAIL, ...route.params });

    return this.store
      .pipe(
        select(state => state.groupReducer),
        map(loaded => loaded.groupDetail),
        filter(loaded => {
          // If should re-init state of groupDetail from reducer
          return loaded;
        }),
        first()
      );
  }
}
