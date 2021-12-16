import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, Effect } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { map, mergeMap, catchError, filter, exhaustMap, withLatestFrom, switchMap, last } from 'rxjs/operators';
import { GroupService } from 'src/app/services/group.service';
import * as GroupActions from './group.actions';
import {
  ACTION_GET_TOP_LANDING_GROUP,
  ACTION_GET_TOP_LANDING_GROUP_COMPLETELY,
  ACTION_GET_GROUP_DETAIL,
  ACTION_GET_GROUP_DETAIL_COMPLETELY,
  ACTION_UPDATE_JOIN_GROUP,
  ACTION_UPDATE_JOIN_GROUP_COMPLETELY,
  ACTION_UPDATE_LAST_SEEN,
  ACTION_UPDATE_LAST_SEEN_COMPLETELY,
  ACTION_GET_LATEST_GROUP_MESSAGE,
  ACTION_GET_LATEST_GROUP_MESSAGE_COMPLETELY,
  ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL,
  ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL_COMPLETELY,
  ACTION_GET_RECENT_MEMBER,
  ACTION_GET_RECENT_MEMBER_COMPLETELY,
  ACTION_GET_LIST_MEMBER_GROUP_DETAIL,
  ACTION_GET_LIST_MEMBER_GROUP_DETAIL_COMPLETELY,
  ACTION_GET_ALL_YOUR_GROUP,
  ACTION_GET_ALL_YOUR_GROUP_COMPLETELY,
  ACTION_GET_DISCOVER_GROUP,
  ACTION_GET_DISCOVER_GROUP_COMPLETELY,
  ACTION_GET_DISCOVER_GROUP_IDS,
  ACTION_GET_GROUP_DETAIL_BY_ID,
  ACTION_GET_GROUP_DETAIL_BY_ID_COMPLETELY
} from 'src/app/const.actions';

@Injectable()
export class GroupEffects {

  getTopLandingGroup$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_TOP_LANDING_GROUP),
      switchMap(({ payload }) => {
        return this.groupService.getTopLandingGroup(payload)
          .pipe(
            map(res => {
              return ({ type: ACTION_GET_TOP_LANDING_GROUP_COMPLETELY, payload: res });
            }),
            catchError(() => EMPTY)
          );
      })
    ));

  getGroupDetail$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_GROUP_DETAIL),
      switchMap(({ payload }) => {
        return this.groupService.getGroupDetail(payload)
          .pipe(
            last(),
            map(res => {
              return ({ type: ACTION_GET_GROUP_DETAIL_COMPLETELY, payload: res });
              // return new groupActions.GetGroupDetailActionCompletly(res);
            }),
            catchError(() => EMPTY)
          );
      })
    ));

  getGroupDetailById$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_GROUP_DETAIL_BY_ID),
      switchMap(({ payload }) => {
        return this.groupService.getGroupDetailById(payload).pipe(
          last(),
          map(res => {
            return ({ type: ACTION_GET_GROUP_DETAIL_BY_ID_COMPLETELY, payload: res });
          }),
          catchError(() => EMPTY)
        );
      })
    )
  );

  joinOrUnJoinGroup$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_UPDATE_JOIN_GROUP),
      mergeMap(({ payload }) => {
        return this.groupService.joinOrUnJoinGroup(payload)
          .pipe(
            last(),
            map(res => {
              return ({ type: ACTION_UPDATE_JOIN_GROUP_COMPLETELY, payload: res });
            })
          );
      })
    )
  );

  updateLastSeen$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_UPDATE_LAST_SEEN),
      switchMap(({ payload }) => {
        return this.groupService.updateLastSeen(payload).pipe(
          map(res => ({ type: ACTION_UPDATE_LAST_SEEN_COMPLETELY, payload: res })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  getLatestGroupMessage$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_LATEST_GROUP_MESSAGE),
      switchMap(
        ({ payload }) => {
          return this.groupService.getLatestGroupMessage(payload).pipe(
            map(res => ({ type: ACTION_GET_LATEST_GROUP_MESSAGE_COMPLETELY, payload: res })),
            catchError(() => EMPTY)
          );
        }
      )
    )
  );

  getRecentMessageGroupDetail$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL),
      switchMap(
        ({ payload }) => {
          return this.groupService.getRecentMessageGroupDetail(payload).pipe(
            map(res => ({ type: ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL_COMPLETELY, payload: res })),
            catchError(() => EMPTY)
          );
        }
      )
    )
  );

  $getRecentMemberGroupItem = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_RECENT_MEMBER),
      switchMap(
        ({ payload }) => {
          // console.log('payload ACTION_GET_RECENT_MEMBER', payload);
          return this.groupService.getRecentMemberGroupItem(payload).pipe(
            map(res => ({ type: ACTION_GET_RECENT_MEMBER_COMPLETELY, payload: res })),
            catchError(() => EMPTY)
          );
        }
      )
    )
  );

  getListMemberGroup$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_LIST_MEMBER_GROUP_DETAIL),
      mergeMap(
        ({ payload }) => {
          return this.groupService.getListMemberGroup(payload).pipe(
            map(res => ({ type: ACTION_GET_LIST_MEMBER_GROUP_DETAIL_COMPLETELY, payload: res })),
            catchError(() => EMPTY)
          );
        }
      )
    )
  );

  $getAllYourGroup = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ACTION_GET_ALL_YOUR_GROUP),
        switchMap(({ payload }) => {
          // console.log('param getAllYourGroup', payload);
          return this.groupService.getAllYourGroup(payload).pipe(
            map(res => ({ type: ACTION_GET_ALL_YOUR_GROUP_COMPLETELY, payload: res })),
            catchError(() => EMPTY)
          );
        })
      );
    }
  );

  getDiscoverGroupItem$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_DISCOVER_GROUP),
      switchMap(({ payload }) => {
        return this.groupService.getDiscoverGroupItem(payload).pipe(
          map(res => ({ type: ACTION_GET_DISCOVER_GROUP_COMPLETELY, payload: res })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  getDiscoveredGroupIds$ = createEffect(
    () => this.actions$.pipe(
      ofType(ACTION_GET_DISCOVER_GROUP_IDS),
      mergeMap(() => {
        return this.groupService.getDiscoveredGroupIds()
          .pipe(
            map((res) => (GroupActions.getDiscoveredGroupIdsCompletetly({ discoverGroupIds: res })))
          );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private groupService: GroupService
  ) { }
}
