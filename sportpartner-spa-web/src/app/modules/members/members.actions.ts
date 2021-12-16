import { ACTION_UNBLOCK_USER } from './../../const.actions';
import { createAction, props } from '@ngrx/store';

import {
  ACTION_GET_MEMBER_PROFILE,
  ACTION_GET_MEMBER_PROFILE_COMPLETELY,
  ACTION_GET_MEMBER_PROFILE_FROM_CHAT_DETAIL,
  ACTION_GET_MY_MEMBER_PROFILE,
  ACTION_GET_MY_MEMBER_PROFILE_COMPLETELY,
  ACTION_TOGGLE_FAVOURITE_MEMBER,
  ACTION_NONE_RESPONSE,
} from 'src/app/const.actions';
import { MemberProfileModel } from 'src/models/member-profile.model';

export const getMemberProfile = createAction(ACTION_GET_MEMBER_PROFILE, props<{ payload: any }>());

export const getMemberProfileFromChat = createAction(ACTION_GET_MEMBER_PROFILE_FROM_CHAT_DETAIL, props<{
  userId: number
}>());

// export const updateMemberProfile = createAction(UPDATE_MEMBER_PROFILE, props<{
//   isSentFirstMessage: boolean
// }>());


export const getMemberProfileCompletely = createAction(
  ACTION_GET_MEMBER_PROFILE_COMPLETELY,
  props<{ payload: Object }>()
);

// Get my member profile
export const getMyMemberProfile = createAction(ACTION_GET_MY_MEMBER_PROFILE);
export const getMyMemberProfileCompletely = createAction(
  ACTION_GET_MY_MEMBER_PROFILE_COMPLETELY,
  props<{ payload: MemberProfileModel }>()
);

export const toggleFavoriteMember = createAction(ACTION_TOGGLE_FAVOURITE_MEMBER, props<{ payload: any }>());

export const noneResponse = createAction(ACTION_NONE_RESPONSE);

export const unblockUser = createAction(ACTION_UNBLOCK_USER, props<{
  memberProfile: MemberProfileModel
}>());
