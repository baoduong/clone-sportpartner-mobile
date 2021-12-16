import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ListMemberModel } from 'src/models/list-member.model';
import { Observable, of } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { ACTION_GET_LIST_MEMBER_GROUP_DETAIL } from 'src/app/const.actions';

@Injectable({
    providedIn: 'root',
})

export class ListMemberResolver implements Resolve<ListMemberModel>{

    constructor(private store: Store<{ groupReducer: any }>){

    }

    resolve(): Observable<ListMemberModel> | Observable<any>{
        this.store.dispatch({
            type: ACTION_GET_LIST_MEMBER_GROUP_DETAIL,
            payload: {
                groupId: 25,
                pageIndex: 0,
                pageSize: 5,
                blockerEpoch: '',
                lastSeenEpoch: ''
            }
        })

        return this.getListMemberGroupDetail();
    }

    getListMemberGroupDetail(): Observable<any> {
        return this.store.pipe(
            select(state => state.groupReducer),
            map(loaded => loaded.listMemberGroupDetail),
            filter(loaded => {return loaded;}),
            first()
        )
    }
}