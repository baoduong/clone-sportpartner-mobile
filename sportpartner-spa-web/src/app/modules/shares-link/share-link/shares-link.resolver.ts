import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, createAction, props, select } from '@ngrx/store';
import { tap, filter, first, map } from 'rxjs/operators';
import { ACTION_GET_SHARE_LINK } from 'src/app/const.actions';

@Injectable({ providedIn: 'root' })
export class GetSharesLinkResolver implements Resolve<any> {

  constructor(private store: Store<{ shareLinkReducer: any }>) {

  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.store.dispatch({ type: ACTION_GET_SHARE_LINK, payload: route.queryParams });
    return this.getSharesLink();
  }

  getSharesLink(): Observable<any> {
    return this.store
      .pipe(
        select(state => state.shareLinkReducer),
        map(loaded => loaded.shareLink),
        filter(loaded => !!loaded),
        first()
      );
  }
}
