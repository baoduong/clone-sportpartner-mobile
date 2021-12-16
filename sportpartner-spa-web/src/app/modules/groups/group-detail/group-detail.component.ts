import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Component, OnInit, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, RouterState } from '@angular/router';
import { GroupDetailModel } from 'src/models/group-detail.model';
import { trigger, style, transition, animate, state } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { map, filter, first } from 'rxjs/operators';
import { updateJoinGroupStatus } from '../store/group.actions';
import { Subscription, BehaviorSubject, Observable, empty } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { RouterStateService } from 'src/app/services/router-state.service';
import { ACTION_UPDATE_LAST_SEEN, ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL, ACTION_GET_LIST_MEMBER_GROUP_DETAIL } from 'src/app/const.actions';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { GroupRecentMessageDetail } from 'src/models/group-recent-message-detail.model';
import { PremiumService } from 'src/app/services/premium.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
  animations: [
    trigger('animationMessageBox', [
      transition(':enter', [
        style({ opacity: 0 }), // From
        animate('0.5s ease-out', style({ opacity: 1 })), // to
      ]),
      transition(':leave', [
        style({ position: 'fixed', bottom: 0 }), // From
        animate('0.3s ease-out', style({ position: 'fixed', bottom: '-100px' })), // to
      ])
    ]),
  ]
})
export class GroupDetailComponent implements OnInit, OnDestroy {

  groupDetail$ = new BehaviorSubject<GroupDetailModel>(null);
  myProfile$ = new BehaviorSubject<MemberProfileModel>(null);
  listRecentMessage$ = new BehaviorSubject<GroupRecentMessageDetail[]>([]);

  topListImage: any;
  isShowListMember = false;
  isShowingDialog = false;
  firstClick = true;
  scrollPosition: number;
  store$: Subscription;

  previousUrl = '';
  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private router: Router,
    private actRoute: ActivatedRoute,
    private ren: Renderer2,
    private store: Store<{ groupReducer: any, profileReducer: any }>,
    private appConfig: AppConfig,
    private routerStateService: RouterStateService,
    private premiumService: PremiumService
  ) {
    this.premiumService.premiumInPage.next(true);
    // const title = translateService.instant('Web-Group.GROUP-PAGE.titlePage');
    // this.titleService.setTitle(title);
  }

  ngOnInit(): void {
    this.actRoute.data
      .subscribe(dataResolver => {
        if (dataResolver) {
          this.groupDetail$.next(dataResolver.data);
          const title = this.translateService.instant('Web-Group.GROUP-PAGE.title', {
            group_name: dataResolver.data.groupName
          });
          this.titleService.setTitle(title);
          if (dataResolver.data.conversationId !== '' && dataResolver.data.conversationId !== null) {
            this.store.dispatch({
              type: ACTION_GET_RECENT_MESSAGE_GROUP_DETAIL,
              payload: {
                conversationId: dataResolver.data.conversationId,
                countryCode: this.appConfig.config.country,
                pageSize: 5
              }
            });
          }
          this.store.pipe(
            select(state$ => state$.groupReducer),
            map(loaded => loaded.recentGroupDetalMessage),
            filter(loaded => loaded),
            // first()
          ).subscribe(data => {
            if (data) {
              this.listRecentMessage$.next(data);
            }
          });

          this.myProfile$.next(this.appConfig.config.myProfile as MemberProfileModel);
        }
      }, err => {
        console.log('error', err);
      });

    this.store$ = this.store.select(state$ => state$.groupReducer).pipe(
      map(loaded => loaded.groupDetail),
      filter((newData: GroupDetailModel) => {
        return !!newData && newData.isFollowing !== this.groupDetail$.value.isFollowing;
      })
    ).subscribe(data => {
      this.groupDetail$.next(data);
      if (this.groupDetail$.value.totalMember <= 0) {
        this.router.navigate([`${this.appConfig.config.culture}/group`]);
      } else {
        this.isShowingDialog = false;
      }
    });
  }

  ngOnDestroy() {
    this.store$.unsubscribe();
  }

  goBack() {
    // this.location.back();
    this.router.navigate([`${this.routerStateService.getPreviousUrl()}`]);
  }

  showListMember(isShow: boolean) {
    if (this.groupDetail$.value.totalMember > 1) {
      this.isShowListMember = isShow;
      if (this.isShowListMember === true) {
        this.disableScroll();

        this.store.dispatch({
          type: ACTION_GET_LIST_MEMBER_GROUP_DETAIL,
          payload: {
            groupId: this.groupDetail$.value.id,
            pageIndex: 0,
            pageSize: 20,
            blockerEpoch: '',
            lastSeenEpoch: ''
          }
        });
      } else {
        this.enableScroll();
      }
    }
  }

  hideListMember(value) {
    this.isShowListMember = value;
    this.enableScroll();
    this.updateLastSeen();
  }

  inviteFriends() {
    this.router.navigate([`${this.appConfig.config.culture}/shares`], {
      // relativeTo: this.actRoute,
      queryParams: {
        // userId: 12198,
        countryCode: this.appConfig.config.country,
        // city: this.groupDetail$.cityName,
        // sport: this.groupDetail$.sportName,
        groupId: this.groupDetail$.value.id
      }
    });
  }

  confirmedLeavesGroup($evt) {
    const params = {
      groupId: this.groupDetail$.value.id,
      isJoining: false,
      languageCode: this.appConfig.config.language
    };
    this.store.dispatch(updateJoinGroupStatus({ payload: params }));
  }

  joinGroup() {
    const params = {
      groupId: this.groupDetail$.value.id,
      isJoining: true,
      languageCode: this.appConfig.config.language
    };
    this.store.dispatch(updateJoinGroupStatus({ payload: params }));
  }

  showDialogConfirmLeaveGroup($event) {
    this.isShowingDialog = $event;
  }

  updateLastSeen() {
    if (this.firstClick === true && this.groupDetail$.value.isFollowing === true) {
      // && this.groupDetail$.value.numberNewMembers > 0
      this.store.dispatch({
        type: ACTION_UPDATE_LAST_SEEN,
        payload: {
          groupId: this.groupDetail$.value.id
        }
      });
      this.firstClick = false;
    }
  }

  loadMoreRecentMsg() {
    this.router.navigate([`${this.myProfile$.value.culture}/chat/${this.groupDetail$.value.conversationId}`]);
  }

  joinTheConversation() {
    if (this.myProfile$.value.memberType === 'N' || this.myProfile$.value.memberType === 'S') {
      window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=GroupDetail`);
    } else {
      this.router.navigate([`${this.myProfile$.value.culture}/chat/${this.groupDetail$.value.conversationId}`]);
    }
  }

  disableScroll() {
    this.scrollPosition = window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';
  }

  enableScroll() {
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    window.scrollTo(0, this.scrollPosition);
  }
}
