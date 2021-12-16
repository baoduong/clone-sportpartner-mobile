import {
    ACTION_GET_STATUS_NOTIFICATION,
    ACTION_GET_STATUS_NOTIFICATION_COMPLETELY,
    MARK_READ_NOTIFICATION
} from 'src/app/const.actions';

import { createAction, props } from '@ngrx/store';

export const getStatusNotification = createAction(ACTION_GET_STATUS_NOTIFICATION, props<{ payload: any }>());
export const getStatusNotificationCompletely = createAction(ACTION_GET_STATUS_NOTIFICATION_COMPLETELY, props<{payload: any}>());
export const markReadNotification = createAction(MARK_READ_NOTIFICATION, props<{ payload: any }>());
