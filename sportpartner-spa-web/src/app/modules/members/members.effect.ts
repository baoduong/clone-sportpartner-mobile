import { MessageService } from './../../services/message.service';
import { ACTION_UNBLOCK_USER } from './../../const.actions';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, mergeMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { ProfileService } from 'src/app/services/profile.service';
import * as MemberAction from './members.actions';
import {
  ACTION_GET_MEMBER_PROFILE,
  ACTION_GET_MEMBER_PROFILE_COMPLETELY,
  ACTION_GET_MY_MEMBER_PROFILE,
  ACTION_GET_MEMBER_PROFILE_FROM_CHAT_DETAIL,
  ACTION_TOGGLE_FAVOURITE_MEMBER
} from 'src/app/const.actions';
import { getMyMemberProfileCompletely } from './members.actions';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { AppConfig } from 'src/app/app.config';

@Injectable()
export class MembersEffects {

  constructor(
    private action$: Actions,
    private profileService: ProfileService,
    private messageService: MessageService,
    private appConfig: AppConfig
  ) { }

  getMemberProfile$ = createEffect(
    () => this.action$.pipe(
      ofType(ACTION_GET_MEMBER_PROFILE),
      switchMap(({ payload }) => {
        const { culture, userId } = payload;
        return this.profileService.getMemberProfile({ culture, userId }).pipe(
          map(res => {
            return ({ type: ACTION_GET_MEMBER_PROFILE_COMPLETELY, payload: res });
          }),
          catchError(() => EMPTY)
        );
      })
    )
  );

  getMemberProfileFromChat$ = createEffect(
    () => this.action$.pipe(
      ofType(ACTION_GET_MEMBER_PROFILE_FROM_CHAT_DETAIL),
      switchMap((action) => {
        return this.profileService.getMemberProfileFromChatDetail(action).pipe(
          map(res => {
            return ({ type: ACTION_GET_MEMBER_PROFILE_COMPLETELY, payload: res });
          }),
          catchError(() => EMPTY)
        );
      })
    )
  );

  getMyMemberProfile$ = createEffect(
    () => this.action$.pipe(
      ofType(ACTION_GET_MY_MEMBER_PROFILE),
      mergeMap((action) => {
        return this.profileService.getMyProfile().pipe(
          map((res: MemberProfileModel) => {
            return (getMyMemberProfileCompletely({ payload: res }));
          }),
          catchError(() => EMPTY)
        );
      })
    )
  );

  toggleFavoriteMember$ = createEffect(
    () => this.action$.pipe(
      ofType(ACTION_TOGGLE_FAVOURITE_MEMBER),
      switchMap(({ payload }) => {
        return this.profileService.toggleFavorite(payload).pipe(
          map(() => {
            return MemberAction.noneResponse();
          })
        );
      })
    )
  );

  unblockUser$ = createEffect(
    () => this.action$.pipe(
      ofType(ACTION_UNBLOCK_USER),
      switchMap(({ memberProfile }) => {
        const member = memberProfile as MemberProfileModel;
        const { conversationId } = member.conversation;

        return this.messageService.unblockUser(conversationId).pipe(
          map(() => {
            // member.conversation.isBlocked = true;
            return MemberAction.getMemberProfile({
              payload: {
                userId: member.id,
                culture: this.appConfig.config.culture
              }
            });
          })
        );
      })
    )
  );
}
