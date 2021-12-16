import {
    ACTION_GET_STATUS_NOTIFICATION,
    ACTION_GET_STATUS_NOTIFICATION_COMPLETELY,
    MARK_READ_NOTIFICATION
} from 'src/app/const.actions';

import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SharedEffect {
    constructor(
        private actions$: Actions,
        private sharedService: SharedService
    ) {}

    getStatusNotification$ = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(ACTION_GET_STATUS_NOTIFICATION),
                switchMap(({payload}) => {
                    const { userPublicId } = payload;
                    return this.sharedService.getStatusNotification(userPublicId).pipe(
                        map((res: any) => {
                            const { count } = res;
                            return ({type: ACTION_GET_STATUS_NOTIFICATION_COMPLETELY,
                                payload: {
                                    count: count > 0 ? count : undefined
                                }
                            });
                        })
                    );
                })
            );
        }
    );

    markReadNotification$ = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(MARK_READ_NOTIFICATION),
                switchMap(({payload}) => {
                    const { userPublicId } = payload;
                    return this.sharedService.markReadNotification(userPublicId).pipe(
                        map(res => {
                            return ({type: ACTION_GET_STATUS_NOTIFICATION_COMPLETELY, payload: res});
                        })
                    );
                })
            );
        }
    );
}
