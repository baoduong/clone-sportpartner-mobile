import { MessageTypeEnum } from './../message-detail-item/message-type.enum';
import { MessageReceiveModel } from './../../../../../models/message-receive.model';
import { selectedConversation } from './../../store/chat.actions';
import { WebSocketService } from './../../../../services/websocket.service';
import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';
import { Component, Input, Output, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, filter, map, first, distinctUntilChanged } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { updateJoinGroupStatus } from 'src/app/modules/groups/store/group.actions';
import { LoaderService } from 'src/app/services/loader.service';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { MemberProfileModel } from 'src/models/member-profile.model';
import * as chatActions from '../../store/chat.actions';
import { GroupDetailModel } from 'src/models/group-detail.model';

const ITEMS_PER_PAGE = 20;

@Component({
  selector: 'app-list-button-detail-conversation',
  templateUrl: './list-button-detail-conversation.component.html',
  styleUrls: ['./list-button-detail-conversation.component.scss'],
  animations: [
    trigger('animationOverlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        group([
          animate('0.3s ease', style({ opacity: 1 })),
          query('@animationMobileListButtonConversation', animateChild(), { optional: true })
        ])
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        group([
          query('@animationMobileListButtonConversation', animateChild(), { optional: true }),
          animate('0.3s ease-out', style({ opacity: 0 })), // to
        ])
      ])
    ]),

    trigger('animationMobileListButtonConversation', [
      transition(':enter', [
        style({ transform: 'translateY(100vh)' }),
        animate('0.3s ease', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)' }),
        animate('0.3s ease', style({ transform: 'translateY(100vh)' }))
      ])
    ]),

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
export class ListButtonDetailConversationComponent implements OnInit, OnDestroy {

  deviceType = this.appConfig.config.deviceType$;
  @Input() listBoxType;
  @Input() isShowListButton;
  @Input() room = new BehaviorSubject<ConversationListModel>(undefined);

  @Output() isCloseMenuButton = new EventEmitter();
  @Output() reloadDetailConversation = new EventEmitter();
  @Output() isShowPanelProfile = new EventEmitter();

  isShowDialog = false;
  isShowDialogBlock = false;
  isShowDialogDelete = new BehaviorSubject(false);

  memberProfile$ = new BehaviorSubject<MemberProfileModel>(undefined);
  groupDetail$ = new BehaviorSubject<GroupDetailModel>(undefined);

  groupDetailSub$: Subscription;

  constructor(
    private route: Router,
    private appConfig: AppConfig,
    private store: Store<{ profileReducer: any, groupReducer: any }>,
    private loaderService: LoaderService,
    private ws: WebSocketService
  ) { }

  ngOnInit(): void {
    this.store.pipe(
      select(state$ => state$.profileReducer),
      map(loaded => loaded.memberProfile),
      filter(loaded => loaded),
    ).subscribe(data => {
      if (data) {
        this.memberProfile$.next(data);
      }
    });

    if (this.room.value.conversationType === 'Group') {
      this.groupDetailSub$ = this.store.pipe(
        select(state$ => state$.groupReducer),
        map(loaded => loaded.groupDetail),
        distinctUntilChanged(),
        filter(loaded => !!loaded),
      ).subscribe(data => {
        const { isFollowing } = data;
        this.groupDetail$.next(data);
        if (isFollowing) {
          // TODO: connect ws
          this.ws.joinRoom(this.room.value.conversationId);


        } else {
          // TODO: disconnect ws
          this.ws.leaveRoom(this.room.value.conversationId);
        }

      });
    }
  }

  closeMenuButton() {
    this.isCloseMenuButton.emit(false);
  }

  showDialogLeaveGroup() {
    this.isShowDialog = true;
  }

  closeDialogLeaveGroup(value) {
    this.isShowDialog = value;
  }

  // gotoMemberProfile() {
  //   this.route.navigateByUrl(`${this.appConfig.config.culture}/members/${this.room.value.referenceId}`);
  // }

  showPanelProfile() {
    this.isShowPanelProfile.emit(true);
  }

  gotoDetaiGroup() {
    if (this.groupDetail$) {
      this.route.navigateByUrl(`${this.appConfig.config.culture}/group/${this.groupDetail$.value.urlPathSport}/${this.groupDetail$.value.urlPathCity}`);
    }
  }

  inviteFriends(groupId) {
    this.route.navigate([`${this.appConfig.config.culture}/shares`], {
      queryParams: {
        countryCode: this.appConfig.config.country,
        groupId: groupId
      }
    });
  }

  joinGroup(groupId) {
    const params = {
      groupId: groupId,
      isJoining: true,
      languageCode: this.appConfig.config.language
    };
    this.store.dispatch(updateJoinGroupStatus({ payload: params }));
    this.loaderService.isLoading.next(false);
    // this.reloadDetailConversation.emit(true);
    /* this.store.dispatch(chatActions.selectedConversationCompleted({
      conversation: undefined
    })); */

    // fake message Join for update conversation list
    // const messageJoin = new MessageReceiveModel();
    // messageJoin.messageType = MessageTypeEnum.joinConversation;
    // messageJoin.conversationId = this.room.value.conversationId;
    // messageJoin.sentOnDateType = 'key';
    // messageJoin.sentOnDate = 'today';
    // messageJoin.senderGuid = this.appConfig.config.myProfile.publicId;
    // messageJoin.senderName = this.appConfig.config.myProfile.screenName;
    // this.store.dispatch(chatActions.updateConversationlist({
    //   messageComing: messageJoin,
    //   unreadCount: 0,
    //   isPremium: this.appConfig.config.myProfile.isPremium,
    //   isDisabled: false,
    //   sentOn: 'today',
    // }));

    setTimeout(() => {
      this.store.dispatch(chatActions.selectedConversation({
        conversationId: this.room.value.conversationId
      }));
    }, 300);
  }

  onLeaveGroup($event) {
    // this.reloadDetailConversation.emit(true);
  }

  toggleDialogBlock(status) {
    this.isShowDialogBlock = status;
  }

  toggleDialogDelete() {
    this.isShowDialogDelete.next(!this.isShowDialogDelete.value);
  }

  deleteConversation() {
    this.store.dispatch(chatActions.deleteConversation({
      conversationId: this.room.value.conversationId
    }));
  }

  blockConversation() {
    this.store.dispatch(chatActions.blockConversation({
      conversationId: this.room.value.conversationId
    }));
  }

  clickOutside($event) {
    this.isCloseMenuButton.emit(false);
  }

  ngOnDestroy() {
    if (this.groupDetailSub$) {
      this.groupDetailSub$.unsubscribe();
    }
  }
}
