import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import * as chatActions from '../chat/store/chat.actions';

@Injectable({ providedIn: 'root' })
export class GetFirstListConversationResolver implements Resolve<any> {

    constructor(private store: Store<{ chatReducer: any, }>) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        this.store.dispatch(chatActions.getFirstListConversation({
            category: 'Inbox',
            pageSize: 20
        }));
        return this.getList();
    }

    getList(): Observable<any> {
        return this.store
            .pipe(
                select(state => state.chatReducer),
                map(loaded => loaded.channelConversations),
                filter(loaded => loaded),
                first()
            );
    }
}
