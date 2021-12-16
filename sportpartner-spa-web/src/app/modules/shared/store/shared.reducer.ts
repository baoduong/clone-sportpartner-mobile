import { createReducer, on, Action } from '@ngrx/store';
import * as SharedAction from './shared.actions';

export interface State {
    numberStatusNotification: number;
}

const sharedReducer = createReducer(
    {
        numberStatusNotification: undefined
    },
    on(SharedAction.getStatusNotification, (state, {payload}) => {
        return ({
            ...state,
        });
    }),
    on(SharedAction.getStatusNotificationCompletely, (state, {payload}) => {
        const { count } = payload;
        return ({
            ...state,
            numberStatusNotification: count
        });
    }),
);

export function reducer(state: State | undefined, action: Action) {
    return sharedReducer(state, action);
}
