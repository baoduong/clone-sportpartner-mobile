import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { map, filter } from 'rxjs/operators';
import { MessageSendingModel } from 'src/models/message-sending.model';
import * as chatActions from 'src/app/modules/chat/store/chat.actions';
import { Router } from '@angular/router';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss'],
  animations: [
    trigger('ShowHide', [
      state('show', style({
        minWidth: '50px',
        width: '50px',
      })),
      state('hide', style({
        minWidth: 0,
        width: 0,
      })),
      transition('* <=> *', animate('0.2s'))
    ]),

    trigger('TypeMessage', [
      transition(':enter', [
        style({ height: 0 }),
        animate('0.2s ease-in', style({ height: '70px' })),
      ]),
      transition(':leave', [
        style({ height: '70px' }),
        animate('0.2s ease-out', style({ height: 0 })),
      ])
    ]),
  ]
})
export class SendMessageComponent implements OnInit, AfterViewInit {

  isClickSend = false;
  hideElement = false;
  userProfile = new MemberProfileModel();

  @ViewChild('inputTextArea') inputTextArea: ElementRef;
  @Input() conversationId;
  @Input() groupId;

  constructor(
    public translate: TranslateService,
    private store: Store<{ profileReducer: any }>,
    private route: Router
  ) {
    store.select(state$ => state$.profileReducer).pipe(
      map(loaded => loaded.myMemberProfile),
      filter(profile => !!profile)
    ).subscribe(myProfile => {
      this.userProfile = myProfile;
    });
  }

  ngOnInit(): void {
    // this.translate.get(this.placeholderSendMsg).subscribe((val: string) => {
    //   this.placeholderSendMsg = val;
    // });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const textarea = document.getElementById('text-area');
      textarea.style.height = '0px';

      fromEvent(textarea, 'keyup').subscribe(valueKey => {
        textarea.style.height = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.height = textarea.scrollHeight + 'px';
        if (textarea.scrollHeight > 146) {
          textarea.style.overflow = 'hidden auto';
        }
      });
    }, 200);
  }

  changeIsSend(value) {
    this.isClickSend = value;
    document.getElementById('text-area').focus();
  }

  hide() {
    this.isClickSend = false;
    const input = this.inputTextArea.nativeElement.value;
    // (document.getElementById('text-area') as HTMLInputElement).value;
    if (input !== '') {
      this.hideElement = true;
    } else {
      this.hideElement = false;
    }
  }

  show() {
    this.isClickSend = true;
  }

  sendMessage() {
    const messageBody = this.inputTextArea.nativeElement.value.trim();
    if (messageBody !== '' && messageBody !== null) {
      const message: MessageSendingModel = {
        messageBody: messageBody,
        conversationId: this.conversationId,
        conversationType: 'Group',
        senderGuid: this.userProfile.publicId,
        senderName: this.userProfile.screenName,
        senderPhoto: this.userProfile.avatarUrl,
        referenceId: this.groupId,
        source: SourceMessage.grouppost,
        senderId: this.userProfile.id,
      };

      this.store.dispatch(chatActions.onSendMessage({
        payload: {
          messages: message,
        }
      }));

      // this.loadingService.isLoading.next(true);
      setTimeout(() => {
        this.route.navigate([`${this.userProfile.culture}/chat/${this.conversationId}`]);
      }, 1000);

      this.inputTextArea.nativeElement.value = '';
    }
  }
}
