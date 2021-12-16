import { Action, createReducer, on } from '@ngrx/store';
import * as shareLinkActions from './shares-link.actions';

export interface State {
  shareLink: string;
}


const sharesLinkReducers = createReducer({},
  on(shareLinkActions.getSharesLink, (state) => ({ ...state, shareLink: undefined })),
  on(shareLinkActions.getSharesLinkCompletely, (state, { payload }) => {
    return ({ ...state, shareLink: payload });
  })
);

export function reducer(state: State | undefined, action: Action) {
  return sharesLinkReducers(state, action);
}
