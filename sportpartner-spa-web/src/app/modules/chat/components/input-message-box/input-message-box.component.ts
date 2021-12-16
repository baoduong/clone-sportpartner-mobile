import { MessageTypeEnum } from './../message-detail-item/message-type.enum';
import { DeviceTypes } from 'src/app/const.enum';
import { AutoFocusInputService } from './../../auto-focus-input.service';
import { GroupDetailModel } from './../../../../../models/group-detail.model';
import { ofType } from '@ngrx/effects';
import { GroupEffects } from './../../../groups/store/group.effect';
import { DetectDeviceService } from 'src/app/services/detect-device.service';
import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter, OnDestroy
} from '@angular/core';

import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import * as chatActions from '../../store/chat.actions';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { MessageSendingModel } from 'src/models/message-sending.model';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { map, filter, distinctUntilChanged, takeUntil, distinct, debounceTime } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { ACTION_UPDATE_JOIN_GROUP_COMPLETELY } from 'src/app/const.actions';
@Component({
  selector: 'app-input-message-box',
  templateUrl: './input-message-box.component.html',
  styleUrls: ['./input-message-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationToggleMobileInput', [
      transition(':enter', [
        style({ opacity: 0, position: 'fixed' }),
        animate('0.3s ease', style({ opacity: 1 })), // to
      ]),
    ]),
    trigger('animationHideLabelMobile', [
      state('hideLabel', style({
        // height: 0,
        opacity: 0,
        // display: 'none'
      })),
      state('showLabel', style({
        // height: '*',
        opacity: 1,
        // display: '{{display}}'
      }), {
        params: {
          // display: 'none'
        }
      }),
      transition('hideLabel => showLabel', [
        animate('0.2s ease'),
      ]),
      transition('showLabel => hideLabel', [
        animate('0.2s ease'),
      ]),
    ])
  ]
})
export class InputMessageBoxComponent implements OnInit, AfterViewInit, OnDestroy {

  groupDetail$ = new BehaviorSubject<GroupDetailModel>(undefined);

  @Input() room: BehaviorSubject<ConversationListModel>;

  @ViewChild('textarea') textarea: ElementRef;

  deviceType = this.appConfig.config.deviceType$;

  isShowInputOnMobile = new BehaviorSubject<boolean>(false);
  messageSettings: any;
  userProfile = new MemberProfileModel();

  allowChat$ = new BehaviorSubject<boolean>(true);

  @Output() showInputMessageBox: EventEmitter<any> = new EventEmitter(true);

  destroy = new Subject();

  disableChatEmoji$ = new BehaviorSubject<boolean>(false);

  categorySubcriotion$: Subscription;
  category = 'Inbox';

  friendProfile$ = new BehaviorSubject(new MemberProfileModel());

  isShowDialogDelete = new BehaviorSubject(false);
  currentConversation$: Observable<ConversationListModel>;

  ipadChrome = false;

  constructor(
    private appConfig: AppConfig,
    groupEffects: GroupEffects,
    private cd: ChangeDetectorRef,
    private store: Store<{
      chatReducer: any,
      profileReducer: any,
      groupReducer: any
    }>,
    private autoFocusInputService: AutoFocusInputService) {

    this.currentConversation$ = this.store.select(state$ => state$.chatReducer).pipe(
      takeUntil(this.destroy),
      map(loaded => loaded.selectedConversation),
      filter(loaded => loaded),
      distinctUntilChanged()
    );

    this.store.pipe(
      select(state$ => state$.groupReducer),
      map(loaded => loaded.groupDetail),
      distinctUntilChanged(),
      filter(loaded => !!loaded)
    ).subscribe(data => {
      this.groupDetail$.next(data);
    });

    this.messageSettings = this.appConfig.config.messageSettings;

    store.select(state$ => state$.profileReducer).pipe(
      map(loaded => loaded.myMemberProfile),
      filter(profile => !!profile)
    ).subscribe(myProfile => {
      this.userProfile = myProfile;
    });

    this.categorySubcriotion$ = this.store.select(state$ => state$.chatReducer
    ).pipe(
      map(v => v.category),
      distinctUntilChanged(),
    ).subscribe(category => {
      this.category = category;
    });

    this.store.pipe(
      select(state$ => state$.profileReducer),
      map(loaded => loaded.memberProfile),
      filter(() => this.room && this.room.value && this.room.value.conversationType === 'One'),
      distinctUntilChanged(),
      filter(loaded => loaded),
    ).subscribe(data => {
      this.friendProfile$.next(data);
    });

    /* this.deviceType.subscribe(device => {

    }); */

    // fixed bug: https://infodation.atlassian.net/browse/SPORT-2327
    if (this.deviceType.value === DeviceTypes.tablet) {
      this.ipadChrome = window.navigator.userAgent.indexOf('CriOS') > 0 && window.navigator.platform === 'iPad';
    }

  }
  ngOnInit(): void {
    // this.isShowInputOnMobile.next(false);
  }

  ngAfterViewInit() {
    this.room.pipe(
      takeUntil(this.destroy),
      distinctUntilChanged(),
      filter(data => data !== undefined)
    )
      .subscribe((conversation) => {
        this.disableChatEmoji$.next(false);
        this.allowChat$.next((conversation.conversationType === 'Group' && this.messageSettings.isReadableGroup)
          || (conversation.conversationType === 'One' && this.messageSettings.isReadableOne));

      });

    this.currentConversation$
      .pipe(
        takeUntil(this.destroy),
        filter(() => this.autoFocusInputService.isAutoFocusInput.value),
        filter(data => !!data),
        debounceTime(400)
      )
      .subscribe(() => {
        if (true) {
          this.showInputChatBox();
          this.autoFocusInputService.isAutoFocusInput.next(false);
        }
      });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    this.categorySubcriotion$.unsubscribe();
  }

  showInputChatBox() {
    this.isShowInputOnMobile.next(true);
    // only work for mobile.
    this.showInputMessageBox.emit(true);
    focusInput();
  }

  onBlurInput() {
    // this.showInputMessageBox.emit(false);
    this.isShowInputOnMobile.next(false);
  }

  onFocusInput() {
    // only work for desktop => auto scroll to bottom content
    this.showInputMessageBox.emit(true);
  }

  encodeContent(value) {
    const el = document.createElement('div');
    el.innerText = el.textContent = value;
    value = el.innerHTML;
    return value;
  }

  onSendMessage(messageText) {
    const encodeMessage = this.encodeContent(messageText);
    const encodeSpecialCharacters = this.encodeContent(encodeMessage);
    const message: MessageSendingModel = {
      messageBody: encodeSpecialCharacters,
      conversationId: this.room.value.conversationId,
      conversationType: this.room.value.conversationType, // One | Group
      senderGuid: this.userProfile.publicId,
      senderName: this.userProfile.screenName,
      senderPhoto: this.userProfile.avatarUrl,
      referenceId: this.room.value.referenceId,
      source: this.room.value.conversationType === 'Group' ? SourceMessage.groupchat : SourceMessage.inbox,
      senderId: this.userProfile.id,
      messageType: MessageTypeEnum.Normal,
      isMyMessage: true
    };
    this.store.dispatch(chatActions.onSendMessage({
      payload: {
        messages: message,
      }
    }));
  }

  gotoPayment() {
    window.history.replaceState({}, 'Chat', `/${this.appConfig.config.culture}/chat`);

    setTimeout(() => {
      window.location.href = `${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`;
    }, 500);
  }

  restoreConversation() {
    this.store.dispatch(chatActions.restoreConversation({ conversationId: this.room.value.conversationId }));
  }

  toggleDialogDelete() {
    this.isShowDialogDelete.next(!this.isShowDialogDelete.value);
  }
}


export function focusInput() {

  const targetInput = document.getElementById('txtTextareaMessage');

  const fakeInput = document.createElement('textarea');
  fakeInput.setAttribute('type', 'text');
  fakeInput.setAttribute('autocomplete', 'disabled');
  fakeInput.style.position = 'absolute';
  fakeInput.style.opacity = '0';
  fakeInput.style.height = '0';
  fakeInput.style.fontSize = '16px'; // disable auto zoom

  // you may need to append to another element depending on the browser's auto
  // zoom/scroll behavior
  document.body.prepend(fakeInput);

  // focus so that subsequent async focus will work
  fakeInput.focus();

  setTimeout(() => {

    // now we can focus on the target input
    targetInput.focus();

    // cleanup
    fakeInput.remove();
  }, 500);
}
