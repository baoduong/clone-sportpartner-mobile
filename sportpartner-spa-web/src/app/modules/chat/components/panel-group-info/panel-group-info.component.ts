import { GroupDetailModel } from './../../../../../models/group-detail.model';
import { map, filter, distinctUntilChanged, tap, debounceTime, skip, distinct, takeUntil } from 'rxjs/operators';
import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Output, EventEmitter } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { animate, style, transition, trigger } from '@angular/animations';
import * as GroupAction from '../../../groups/store/group.actions';
import { ListMemberModel } from 'src/models/list-member.model';
import { MemberModel } from 'src/models/member.model';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { PanelType, DeviceTypes } from 'src/app/const.enum';

@Component({
  selector: 'app-panel-group-info',
  templateUrl: './panel-group-info.component.html',
  styleUrls: ['./panel-group-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationToggleDialogConfirm', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.3s ease', style({ opacity: 0 })),
      ])
    ])
  ]
})
export class PanelGroupInfoComponent implements OnInit, OnDestroy {

  @Output() reloadDetailConversation = new EventEmitter();

  groupDetail$ = new BehaviorSubject<GroupDetailModel>(undefined);
  isShowDialogLeaveConversation$ = new BehaviorSubject<boolean>(false);
  listMember$ = new BehaviorSubject<ListMemberModel>({ blocker: undefined, lastSeen: undefined, members: [] });
  isDisableClick$ = new BehaviorSubject<boolean>(true);

  myProfile: any;
  isShowBtnLoadMore = false;

  listMemberSub$: Subscription;

  destroy = new Subject();
  destroy$ = this.destroy.asObservable();

  constructor(
    private togglePanelProfileService: ToggleSidePanelChatDetail,
    private store: Store<{ groupReducer: any }>,
    private appConfig: AppConfig,
    private router: Router
  ) {
    this.myProfile = this.appConfig.config.myProfile;
  }

  ngOnInit(): void {
    this.listMemberSub$ =
      this.store.pipe(
        select(state$ => state$.groupReducer),
        map(loaded => loaded.listMemberGroupDetail),
        filter(loaded => !!loaded),
        distinctUntilChanged(),
      ).subscribe((listMember: ListMemberModel) => {
        this.isDisableClick$.next(true);
        this.listMember$.next({
          blocker: listMember.blocker,
          lastSeen: listMember.lastSeen,
          members: [...this.listMember$.value.members, ...listMember.members]
        });
      });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(state$ => state$.groupReducer),
      map(loaded => loaded.groupDetail),
      filter(loaded => !!loaded),
      distinctUntilChanged(),
      // distinctUntilChanged((prev, curr) => (prev && curr) && prev.isFollowing === curr.isFollowing && prev.id === curr.id),
      tap((loaded) => {
        this.resetListMember();
      })
    ).subscribe((groupDetail: GroupDetailModel) => {
      // update last seen when switch 2 conversation group
      if (this.groupDetail$.value !== undefined && this.groupDetail$.value.id !== groupDetail.id) {
        if (this.groupDetail$.value && this.groupDetail$.value.numberNewMembers > 0 && this.groupDetail$.value.isFollowing === true) {
          this.store.dispatch(GroupAction.updateLastSeen({
            payload: {
              groupId: this.groupDetail$.value.id
            }
          }));
        }
      }

      this.groupDetail$.next(groupDetail);
      this.dispatchGetListMember(this.groupDetail$.value.id, 5, '', '');

      if (groupDetail.totalMember > 5) {
        this.isShowBtnLoadMore = true;
      }

      // update last seen when subscribe value to close panel
      this.togglePanelProfileService.isShowPanel$.pipe(
        takeUntil(this.destroy$),
        filter(() => this.togglePanelProfileService.panelType$.value === PanelType.GROUP_INFO),
        filter(() => this.groupDetail$.value.numberNewMembers > 0 && this.groupDetail$.value.isFollowing === true),
        filter(val => !val),
        skip(1)
      ).subscribe(val => {
        this.store.dispatch(GroupAction.updateLastSeen({
          payload: {
            groupId: this.groupDetail$.value.id
          }
        }));

        this.store.dispatch(GroupAction.getGroupDetailById({
          payload: {
            groupId: this.groupDetail$.value.id,
            languageCode: this.appConfig.config.language
          }
        }));
      });
    });
  }

  dispatchGetListMember(groupId, pageSize, blocker, lastSeen) {
    this.store.dispatch(GroupAction.getListMemberGroupDetail({
      payload: {
        groupId: groupId,
        pageSize: pageSize,
        blockerEpoch: blocker,
        lastSeenEpoch: lastSeen
      }
    }));
  }

  lazyLoadGroupMember() {
    this.isDisableClick$.next(false);
    this.dispatchGetListMember(this.groupDetail$.value.id, 10, this.listMember$.value.blocker, this.listMember$.value.lastSeen);
  }

  closePanel() {
    this.togglePanelProfileService.isShowPanel$.next(false);

    // if (this.groupDetail$.value.numberNewMembers > 0 && this.groupDetail$.value.isFollowing === true) {
    //   // update last seen when close panel
    //   console.log('%c%s', 'color: #7f2200', 'update last seen when close panel');
    //   this.store.dispatch(GroupAction.updateLastSeen({
    //     payload: {
    //       groupId: this.groupDetail$.value.id
    //     }
    //   }));

    //   this.store.dispatch(GroupAction.getGroupDetailById({
    //     payload: {
    //       groupId: this.groupDetail$.value.id,
    //       languageCode: this.appConfig.config.language
    //     }
    //   }));
    // }
  }

  toggleDialogLeaveConversation(value) {
    this.isShowDialogLeaveConversation$.next(value);
  }

  gotoGroupDetail() {
    this.router.navigateByUrl(`${this.appConfig.config.culture}/group/${this.groupDetail$.value.urlPathSport}/${this.groupDetail$.value.urlPathCity}`);
  }

  inviteFriends() {
    this.router.navigate([`${this.appConfig.config.culture}/shares`], {
      queryParams: {
        countryCode: this.appConfig.config.country,
        groupId: this.groupDetail$.value.id
      }
    });
  }

  leaveConversation() {
    const params = {
      groupId: this.groupDetail$.value.id,
      isJoining: false,
      languageCode: this.appConfig.config.language
    };
    this.store.dispatch(GroupAction.updateJoinGroupStatus({ payload: params }));
    this.isShowDialogLeaveConversation$.next(false);
    this.reloadDetailConversation.emit(true);
  }

  reJoinGroup() {
    const params = {
      groupId: this.groupDetail$.value.id,
      isJoining: true,
      languageCode: this.appConfig.config.language
    };
    this.store.dispatch(GroupAction.updateJoinGroupStatus({ payload: params }));
    this.reloadDetailConversation.emit(true);
  }

  resetListMember() {
    /*     if (this.listMemberSub$) {
          this.listMemberSub$.unsubscribe();
        } */
    this.listMember$.next({ blocker: undefined, lastSeen: undefined, members: [] });
    this.store.dispatch(GroupAction.resetListMemberGroupDetail());
  }

  ngOnDestroy() {
    if (this.groupDetail$.value.numberNewMembers > 0 && this.groupDetail$.value.isFollowing === true) {
      this.store.dispatch(GroupAction.updateLastSeen({
        payload: {
          groupId: this.groupDetail$.value.id
        }
      }));
    }
    this.listMemberSub$.unsubscribe();
    this.destroy.next();
    this.destroy.complete();
  }
}
