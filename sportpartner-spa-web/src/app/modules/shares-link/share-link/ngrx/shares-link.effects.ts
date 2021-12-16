import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, Effect } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError, filter } from 'rxjs/operators';

import { ShareLinkService } from 'src/app/services/share-link.service';
import { ACTION_GET_SHARE_LINK, ACTION_GET_SHARE_LINK_COMPLETELY } from 'src/app/const.actions';

@Injectable()
export class SharesLinkEffects {

  getShareLink$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_SHARE_LINK),
      mergeMap((action: Actions) => {
        return this.shareLinksService.getSharesLink(action['payload'])
          .pipe(
            map(link => {
              return ({ type: ACTION_GET_SHARE_LINK_COMPLETELY, payload: link['invitationLink'] });
            }),
            catchError(() => EMPTY)
          );
      })
    ));

  constructor(
    private actions$: Actions,
    private shareLinksService: ShareLinkService
  ) { }
}
