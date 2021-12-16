import { Action, createReducer, on } from '@ngrx/store';
import * as GroupActions from './group.actions';
import { GroupDetailModel } from 'src/models/group-detail.model';
import { GroupLatestMessage } from 'src/models/group-latest-message.model';
import { GroupRecentMessageDetail } from 'src/models/group-recent-message-detail.model';
import { RecentMemberGroupModel } from 'src/models/recent-member-group';
import { ListMemberModel } from 'src/models/list-member.model';

export interface State {
  landingGroup: Array<GroupDetailModel>;
  groupDetail: GroupDetailModel;
  latestGroupMessage: Array<GroupRecentMessageDetail>;
  recentGroupDetalMessage: Array<GroupRecentMessageDetail>;
  recentMember: RecentMemberGroupModel;
  listMemberGroupDetail: ListMemberModel;
  updateLastSeen: any;
  yourGroup: Array<GroupDetailModel>;
  discoverGroup: Array<GroupDetailModel>;
  discoverGroupIds: any;
}

const GroupReducers = createReducer({
  listMemberGroupDetail: undefined
},
  on(GroupActions.getTopLandingGroup, (state) => ({ ...state, landingGroup: undefined })),
  on(GroupActions.getTopLandingGroupCompletely, (state, { payload }) => {
    return ({ ...state, landingGroup: payload });
  }),

  on(GroupActions.getGroupDetail, (state) => {
    return ({ ...state, groupDetail: undefined });
  }),

  on(GroupActions.getGroupDetailCompletely, (state, { payload }) => {
    return ({ ...state, groupDetail: payload });
  }),

  on(GroupActions.getGroupDetailById, (state) => {
    return ({
      ...state,
      groupDetail: undefined,
      listMemberGroupDetail: undefined
    });
  }),
  on(GroupActions.getGroupDetailByIdCompletely, (state, { payload }) => {
    return ({ ...state, groupDetail: payload });
  }),

  on(GroupActions.updateJoinGroupStatus, (state, { payload }) => ({ ...state, groupDetail: undefined })),
  on(GroupActions.updateJoinGroupStatusCompletely, (state, { payload }) => {
    return ({ ...state, groupDetail: payload });
  }),
  on(GroupActions.updateLastSeen, (state) => {
    return ({ ...state, updateLastSeen: undefined });
  }),
  on(GroupActions.updateLastSeenCompletely, (state, { payload }) => {
    return ({ ...state, updateLastSeen: payload });
  }),

  on(GroupActions.getLatestGroupMessage, (state) => {
    return ({ ...state, latestGroupMessage: undefined });
  }),
  on(GroupActions.getLatestGroupMessageCompletely, (state, { payload }) => {
    const mapObject = payload.map(value => {
      return Object.assign(new GroupRecentMessageDetail(
        value.avatar,
        value.screenName,
        value.sentOnType,
        value.sentOn,
        value.userPublicId), value);
    });
    // console.log('%c%s', 'color: #997326', 'payload', mapObject);
    return ({ ...state, latestGroupMessage: mapObject });
  }),

  on(GroupActions.getRecentMessageGroupDetail, (state) => {
    return ({ ...state, recentGroupDetalMessage: undefined });
  }),
  on(GroupActions.getRecentMessageGroupDetailCompletely, (state, { payload }) => {
    return ({ ...state, recentGroupDetalMessage: payload });
  }),
  on(
    GroupActions.getRecentMember,
    (state) => ({ ...state, recentMember: undefined }),
  ),
  on(
    GroupActions.getRecentMemberCompletely,
    (state, { payload }) => ({ ...state, recentMember: payload })
  ),
  on(GroupActions.getListMemberGroupDetail, (state) => {
    // console.log('getListMemberGroupDetail');
    return ({
      ...state,
      listMemberGroupDetail: undefined
    });
  }),
  on(GroupActions.getListMemberGroupDetailCompletely, (state, { payload }) => {
    return ({ ...state, listMemberGroupDetail: payload });
  }),
  on(GroupActions.resetListMemberGroupDetail, (state) => {
    return ({ ...state, listMemberGroupDetail: undefined });
  }),

  on(GroupActions.getAllYourGroup, (state) => ({ ...state, yourGroup: undefined })),
  on(GroupActions.getAllYourGroupCompletely, (state, { payload }) => {
    return ({ ...state, yourGroup: payload });
  }),

  // Discover Group
  on(
    GroupActions.getDiscoverGroup,
    (state) => ({ ...state, discoverGroup: undefined })
  ),
  on(
    GroupActions.getDiscoverGroupCompletely,
    (state, { payload }) => ({ ...state, discoverGroup: payload })
  ),

  on(GroupActions.getDiscoveredGroupIds, (state) => ({ ...state, discoverGroupIds: undefined })),

  on(
    GroupActions.getDiscoveredGroupIdsCompletetly,
    (state, { discoverGroupIds }) => ({ ...state, discoverGroupIds: discoverGroupIds })
  )
);

export function reducer(state: State | undefined, action: Action) {
  return GroupReducers(state, action);
}
