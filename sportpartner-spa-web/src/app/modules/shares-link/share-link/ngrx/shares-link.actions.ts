import { createAction, props } from '@ngrx/store';
import { ACTION_GET_SHARE_LINK, ACTION_GET_SHARE_LINK_COMPLETELY } from 'src/app/const.actions';

export const getSharesLink = createAction(ACTION_GET_SHARE_LINK, props<{ payload: Object }>());

export const getSharesLinkCompletely = createAction(ACTION_GET_SHARE_LINK_COMPLETELY,
  props<{ payload: Object }>()
);

