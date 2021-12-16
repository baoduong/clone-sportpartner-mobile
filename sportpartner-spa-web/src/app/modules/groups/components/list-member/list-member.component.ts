import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy, DoCheck, ChangeDetectionStrategy } from '@angular/core';
import { fromEvent, BehaviorSubject, Subscription, Subject, of, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap, distinctUntilChanged, map, filter, takeUntil, take, repeatWhen, distinct } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import {
  ACTION_GET_LIST_MEMBER_GROUP_DETAIL,
} from 'src/app/const.actions';
import { AppConfig } from 'src/app/app.config';
import { MemberModel } from 'src/models/member.model';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DeviceTypes } from 'src/app/const.enum';

const PAGE_SIZE = 20;
@Component({
  selector: 'app-list-member',
  templateUrl: './list-member.component.html',
  styleUrls: ['./list-member.component.scss'],
  animations: [
    trigger('CloseListMember', [
      state('mobileClose', style({ 'bottom': '-100vh' })),
      state('desktopClose', style({ 'visibility': 'hidden', 'opacity': 0 })),
      transition('* => mobileClose', [animate('0.3s')]),
      transition('* => desktopClose', [animate('0.3s')])
    ]),
    trigger('loadingListAnimation', [
      transition(':leave', [
        style({opacity: 1, height: '*'}),
        animate('0.3s ease', style({opacity: 0, height: 0, overflow: 'hidden'}))
      ])
    ])
  ]
})
export class ListMemberComponent implements OnInit, AfterViewInit, OnDestroy, DoCheck {

  // listMember$ = new BehaviorSubject<ListMemberModel>(null);
  @Input() groupId;
  @Input() isFollowing;
  @Input() totalMember;
  @Output() disableShow = new EventEmitter();
  @ViewChild('listMemberElement') listMemberElement: ElementRef;

  listMember: MemberModel[] = [];
  myProfile: MemberProfileModel;
  isLoadFullList = false;
  pageIndexParam = 1;
  blockerParam: number;
  lastSeenParam: number;
  stateAnimation = '';
  scrollHeight = 0;

  isShowListMember$ = new BehaviorSubject<boolean>(false);
  isShowLoadingIcon$ = new BehaviorSubject<boolean>(false);
  subject$ = new Subject();

  constructor(
    private route: Router,
    private detectDevice: DetectDeviceService,
    private store: Store<{ groupReducer: any }>,
    private appConfig: AppConfig,
    private ref: ChangeDetectorRef,

  ) {
    this.myProfile = this.appConfig.config.myProfile as MemberProfileModel;

    this.store.pipe(
      takeUntil(this.subject$),
      tap(() => {
        this.isLoadFullList = false;
        this.isShowLoadingIcon$.next(true);
      }),
      select(state$ => state$.groupReducer),
      map(loaded => loaded.listMemberGroupDetail),
      filter(loaded => !!loaded),
      // delay(1000),
      distinctUntilChanged()
    ).subscribe(data => {
      this.isShowListMember$.next(true);
      if (data.members.length < PAGE_SIZE) {
        this.isShowLoadingIcon$.next(false);
        this.isLoadFullList = true;
      }
      // this.listMember$.next(data);
      this.listMember = [...this.listMember, ...data.members];
      this.ref.detectChanges();
      this.blockerParam = data.blocker;
      this.lastSeenParam = data.lastSeen;


      fromEvent(this.listMemberElement.nativeElement, 'scroll').pipe(
        takeUntil(this.subject$),
        map((el: any) => {
          return {
            scrollTop: Math.ceil(el.target.scrollTop),
            scrollHeight: el.target.scrollHeight,
            clientHeight: el.target.clientHeight
          };
        }),
        filter(() => !this.isLoadFullList),
        filter((val) => val.scrollTop >= (val.scrollHeight -  (val.clientHeight + val.scrollHeight * 0.3))),
        filter(() => this.scrollHeight !== this.listMemberElement.nativeElement.scrollHeight),
        distinctUntilChanged(),
      ).subscribe(val => {
        this.scrollHeight = this.listMemberElement.nativeElement.scrollHeight;

        this.store.dispatch({
          type: ACTION_GET_LIST_MEMBER_GROUP_DETAIL,
          payload: {
            groupId: this.groupId,
            pageIndex: this.pageIndexParam,
            pageSize: PAGE_SIZE,
            blockerEpoch: this.blockerParam,
            lastSeenEpoch: this.lastSeenParam
          }
        });
        this.pageIndexParam++;
      });
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  ngDoCheck() {
  }

  hideListMember(value) {
    if (this.appConfig.config.deviceType$.value === DeviceTypes.desktop) {
      this.stateAnimation = 'desktopClose';
    } else {
      this.stateAnimation = 'mobileClose';
    }

    setTimeout(() => {
      this.disableShow.emit(value);
      this.stateAnimation = '';
    }, 250);
  }

  ngOnDestroy() {
    this.subject$.next();
    this.subject$.complete();
    this.isShowListMember$.unsubscribe();
    this.isShowLoadingIcon$.unsubscribe();
  }
}
