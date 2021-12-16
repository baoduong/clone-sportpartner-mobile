import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, observable } from 'rxjs';
import { GroupService } from 'src/app/services/group.service';
import { catchError, tap, filter, first, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { ACTION_GET_TOP_LANDING_GROUP } from 'src/app/const.actions';
import { AppConfig } from 'src/app/app.config';

@Injectable({ providedIn: 'root' })

export class GetGroupCardLandingResolver implements Resolve<any> {

  constructor(private store: Store<{ groupReducer: any }>, private appConfig: AppConfig) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.store.dispatch({
      type: ACTION_GET_TOP_LANDING_GROUP, payload: {
        pageSize: 5,
        culture: this.appConfig.config.culture,
        languageCode: this.appConfig.config.language
      }
    });
    return this.getTopLandingGroup(route);
  }

  getTopLandingGroup(route): Observable<any> {

    return this.store
      .pipe(
        select(state => state.groupReducer),
        map(loaded => loaded.landingGroup),
        filter(loaded => loaded),
        first()
      );
  }
}

