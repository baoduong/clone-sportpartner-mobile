import { createAction, props } from '@ngrx/store';
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
  ACTION_GET_DISCOVER_GROUP_IDS_COMPLETELY,
  ACTION_RESET_LIST_MEMBER_GROUP_DETAIL_COMPLETELY,
  ACTION_GET_GROUP_DETAIL_BY_ID,
  ACTION_GET_GROUP_DETAIL_BY_ID_COMPLETELY
} from 'src/app/const.actions';
import { GroupDetailModel } from 'src/models/group-detail.model';
import { GroupLatestMessage } from 'src/models/group-latest-message.model';
import { GroupRecentMessageDetail } from 'src/models/group-recent-message-detail.model';
import { RecentMemberGroupModel } from 'src/models/recent-member-group';
import { ListMemberModel } from 'src/models/list-member.model';

export const getTopLandingGroup = createAction(ACTION_GET_TOP_LANDING_GROUP, props<{ payload: Object }>());
export const getTopLandingGroupCompletely = createAction(ACTION_GET_TOP_LANDING_GROUP_COMPLETELY,
  props<{ payload: Object }>()
);

export const getGroupDetail = createAction(ACTION_GET_GROUP_DETAIL, props<{ payload: Object }>());
export const getGroupDetailCompletely = createAction(ACTION_GET_GROUP_DETAIL_COMPLETELY,
  props<{ payload: GroupDetailModel }>()
);

export const getGroupDetailById = createAction(ACTION_GET_GROUP_DETAIL_BY_ID, props<{ payload: Object }>());
export const getGroupDetailByIdCompletely = createAction(ACTION_GET_GROUP_DETAIL_BY_ID_COMPLETELY, props<{ payload: GroupDetailModel }>());

export const updateJoinGroupStatus = createAction(ACTION_UPDATE_JOIN_GROUP, props<{ payload: Object }>());
export const updateJoinGroupStatusCompletely = createAction(ACTION_UPDATE_JOIN_GROUP_COMPLETELY,
  props<{ payload: GroupDetailModel }>()
);

export const updateLastSeen = createAction(ACTION_UPDATE_LAST_SEEN, props<{ payload: Object }>());
export const updateLastSeenCompletely = createAction(ACTION_UPDATE_LAST_SEEN_COMPLETELY, props<{ payload: Object }>());

export const getLatestGroupMessage = createAction(
  ACTION_GET_LATEST_GROUP_MESSAGE,
  props<{ payload: Object }>()
);
export const getLatestGroupMessageCompletely = createAction(
  ACTION_GET_LATEST_GROUP_MESSAGE_COMPLETELY,
  props<{ payload: Array<GroupLatestMessage> }>()
);

export const getRecentMessageGroupDetail = createAction(
  ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL,
  props<{ payload: Object }>()
);
export const getRecentMessageGroupDetailCompletely = createAction(
  ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL_COMPLETELY,
  props<{ payload: Array<GroupRecentMessageDetail> }>()
);

export const getRecentMember = createAction(
  ACTION_GET_RECENT_MEMBER,
  props<{ payload: Object }>(),
);

export const getRecentMemberCompletely = createAction(
  ACTION_GET_RECENT_MEMBER_COMPLETELY,
  props<{ payload: RecentMemberGroupModel }>(),
);

export const getListMemberGroupDetail = createAction(
  ACTION_GET_LIST_MEMBER_GROUP_DETAIL,
  props<{ payload: Object }>()
);

export const getListMemberGroupDetailCompletely = createAction(
  ACTION_GET_LIST_MEMBER_GROUP_DETAIL_COMPLETELY,
  props<{ payload: ListMemberModel }>()
);

export const resetListMemberGroupDetail = createAction(
  ACTION_RESET_LIST_MEMBER_GROUP_DETAIL_COMPLETELY
);


export const getAllYourGroup = createAction(
  ACTION_GET_ALL_YOUR_GROUP,
  props<{ payload: Object }>()
);

export const getAllYourGroupCompletely = createAction(
  ACTION_GET_ALL_YOUR_GROUP_COMPLETELY,
  props<{ payload: GroupDetailModel }>(),
);

/* export class GetGroupDetailAction implements Action {
  type = ACTION_GET_GROUP_DETAIL;
  constructor(public payload: Object) { }
} */

// Discover Group
export const getDiscoverGroup = createAction(
  ACTION_GET_DISCOVER_GROUP,
  props<{ payload: Object }>(),
);

export const getDiscoverGroupCompletely = createAction(
  ACTION_GET_DISCOVER_GROUP_COMPLETELY,
  props<{ payload: GroupDetailModel }>(),
);

export const getDiscoveredGroupIds = createAction(ACTION_GET_DISCOVER_GROUP_IDS);
export const getDiscoveredGroupIdsCompletetly = createAction(
  ACTION_GET_DISCOVER_GROUP_IDS_COMPLETELY,
  props<{ discoverGroupIds: any }>()
);
