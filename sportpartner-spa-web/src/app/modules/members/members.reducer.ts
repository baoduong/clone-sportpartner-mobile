import { Action, createReducer, on } from '@ngrx/store';
import * as MemberAction from './members.actions';
import { MemberProfileModel } from 'src/models/member-profile.model';

export interface State {
  memberProfile: MemberProfileModel;
  myMemberProfile: MemberProfileModel;
}

const MemberReducer = createReducer({
  memberProfile: undefined,
  myMemberProfile: undefined
},
  on(MemberAction.getMemberProfile, (state) => {
    return ({
      ...state,
      memberProfile: undefined
    });
  }),
  on(MemberAction.getMemberProfileCompletely, (state, { payload }) => {
    return ({ ...state, memberProfile: payload });
  }),

  on(MemberAction.getMyMemberProfile, (state) => state),

  on(MemberAction.getMyMemberProfileCompletely, (state, { payload }) => {
    return ({ ...state, myMemberProfile: payload });
  }),

  on(MemberAction.unblockUser, (state, { memberProfile }) => {
    return ({ ...state, memberProfile });
  }),
  on(MemberAction.toggleFavoriteMember, (state, { payload }) => {
    const { setState } = payload;
    const member = {
      ...state.memberProfile,
      isFavorite: setState,
    };
    return ({
      ...state,
      memberProfile: member
    });
  }),

  // on(MemberAction.updateMemberProfile, (state, { isSentFirstMessage }) => {
  //   const conversation = state.memberProfile.conversation;
  //   return ({
  //     ...state,
  //     memberProfile: { ...state.memberProfile, conversation: { ...conversation, isSentFirstMessage: isSentFirstMessage } }
  //   });
  // })
);

export function reducer(state: State | undefined, action: Action) {
  return MemberReducer(state, action);
}
