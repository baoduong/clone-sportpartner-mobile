import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy, Renderer2 } from '@angular/core';
import { trigger, style, state, transition, animate } from '@angular/animations';

import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { GroupService } from 'src/app/services/group.service';
import { Store, select } from '@ngrx/store';
import { ACTION_GET_RECENT_MEMBER, ACTION_GET_RECENT_MEMBER_COMPLETELY } from 'src/app/const.actions';
import { AppConfig } from 'src/app/app.config';
import { Router } from '@angular/router';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { DeviceTypes } from 'src/app/const.enum';


@Component({
  selector: 'app-recent-member',
  templateUrl: './recent-member.component.html',
  styleUrls: ['./recent-member.component.scss'],
  animations: [
    trigger('CloseRecentMember', [
      state('mobileClose', style({ 'bottom': '-100vh' })),
      state('desktopClose', style({ 'visibility': 'hidden', 'opacity': 0 })),
      transition('* => mobileClose', [animate('0.3s')]),
      transition('* => desktopClose', [animate('0.3s')])
    ]
    )
  ]
})
export class RecentMemberComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() isClosePopup = new EventEmitter();
  @ViewChild('recentMemberElement') recentMemberElement: ElementRef;

  myProfile: MemberProfileModel;
  listRecentMemberId = [];
  listMember = [];
  stateAnimation = '';
  isShowRecentMember$ = new BehaviorSubject<boolean>(false);
  recentMemberSub$: Subscription;

  constructor(
    private detectDevice: DetectDeviceService,
    private groupService: GroupService,
    private store: Store<{ groupReducer: any }>,
    private appConfig: AppConfig,
    private ref: ChangeDetectorRef,
    private router: Router,
    private ren: Renderer2,
  ) {
    this.myProfile = this.appConfig.config.myProfile as MemberProfileModel;
    this.groupService.getRecentMemberGroupId().subscribe(data => {
      if (data) {
        this.listRecentMemberId = data as Array<number>;
        this.store.dispatch({
          type: ACTION_GET_RECENT_MEMBER,
          payload: {
            params: {
              culture: this.appConfig.config.culture,
              languageCode: this.appConfig.config.language,
            },
            body: this.listRecentMemberId.splice(0, 5),
          }
        });
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getRecentMember().then(() => {
        const height = this.recentMemberElement.nativeElement.clientHeight;
        fromEvent(this.recentMemberElement.nativeElement, 'scroll').pipe(
          distinctUntilChanged()
        ).subscribe(data => {
          const scrollHeight = this.recentMemberElement.nativeElement.scrollHeight;
          if (scrollHeight - Math.round(this.recentMemberElement.nativeElement.scrollTop) === height) {
            if (this.listRecentMemberId.length > 0) {
              this.store.dispatch({
                type: ACTION_GET_RECENT_MEMBER,
                payload: {
                  params: {
                    culture: this.appConfig.config.culture,
                    languageCode: this.appConfig.config.language,
                  },
                  body: this.listRecentMemberId.splice(0, 5),
                }
              });
            }
          }
        });
      });
    }, 500);
  }

  getRecentMember() {
    return new Promise((resolve, rejects) => {
      this.recentMemberSub$ = this.store.pipe(
        select(state$ => {
          // console.log('state$', state$);
          return state$.groupReducer;
        }),
        map(loaded => loaded.recentMember),
        // filter(loaded => loaded),
      ).subscribe(dataRecentMember => {
        this.isShowRecentMember$.next(true);
        if (dataRecentMember) {
          this.listMember = [...this.listMember, ...dataRecentMember];
          // console.log('listMember', this.listMember);
        }
        this.ref.detectChanges();
        resolve(null);
      });
    });
  }

  closeRecentMember(value) {
    this.setStateAnimation();

    setTimeout(() => {
      this.isClosePopup.emit(value);
      this.stateAnimation = '';
    }, 250);
  }

  gotoGroupDetail(urlPathSport, urlPathCity) {
    this.setStateAnimation();
    setTimeout(() => {
      this.isClosePopup.emit(false);
      this.stateAnimation = '';
      this.ren.removeClass(document.body, 'overflow-hidden');
      this.router.navigateByUrl(`${this.appConfig.config.culture}/group/${urlPathSport}/${urlPathCity}`);
    }, 280);
  }

  setStateAnimation() {
    if (this.appConfig.config.deviceType$.value === DeviceTypes.desktop) {
      this.stateAnimation = 'desktopClose';
    } else {
      this.stateAnimation = 'mobileClose';
    }
  }

  ngOnDestroy() {
    this.isShowRecentMember$.next(false);
    this.recentMemberSub$.unsubscribe();
  }
}
