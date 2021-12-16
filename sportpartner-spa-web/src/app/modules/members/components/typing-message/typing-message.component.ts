import { AppConfig } from 'src/app/app.config';
import { Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { fromEvent, BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { ConversationListModel } from 'src/models/conversation-list.model';

@Component({
  selector: 'app-typing-message',
  templateUrl: './typing-message.component.html',
  styleUrls: ['./typing-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypingMessageComponent implements OnInit, AfterViewInit, OnDestroy {

  deviceType = this.appConfig.config.deviceType$;

  @Input() isDisableSend;

  @Input() focusToInput: boolean;

  @Output() sentMessage = new EventEmitter<string>(true);

  @Output() blurInput = new EventEmitter<any>(true);

  @Output() focusInput = new EventEmitter<any>(false);

  @ViewChild('textarea') textarea: ElementRef;

  destroy = new Subject();

  isDisabledSend = false;
  myProfile: any;

  isShowSelectingEmoji = new BehaviorSubject<boolean>(false);

  emojiIcons = [
    { key: '😂', img: 'joy.png' },
    { key: '😄', img: 'smile.png' },
    { key: '😍', img: 'heart_eyes.png' },
    { key: '😜', img: 'stuck_out_tongue_winking_eye.png' },
    { key: '👍', img: 'like.png' },
    { key: '👊', img: 'facepunch.png' },
    { key: '👋', img: 'wave.png' }
  ];
  constructor(private cd: ChangeDetectorRef, private appConfig: AppConfig) {
    this.myProfile = this.appConfig.config.myProfile;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // if (this.focusToInput) {
    //   this.textarea.nativeElement.focus();
    // }

    fromEvent(this.textarea.nativeElement, 'keyup').subscribe(keyValue => {
      this.isDisabledSend = !(this.textarea.nativeElement.value.length > 0);
      this.updateInputHeight();
    });
  }

  onBlurInput() {
    this.blurInput.emit(false);
  }

  onFocusInput() {
    this.focusInput.emit(true);
  }

  onKeydownEnter(event) {
    event.preventDefault();
    if (!this.isDisabledSend) {
      this.sendMessage();
    }
  }

  sendMessage() {
    const messageText = this.textarea.nativeElement.value.trim();
    if (messageText.length > 0) {
      this.sentMessage.emit(messageText);
      this.textarea.nativeElement.value = '';
      this.updateInputHeight();
      this.isDisabledSend = true;
    }
  }

  private updateInputHeight() {
    const textArea = document.getElementById('txtTextareaMessage');
    textArea.style.overflow = 'hidden auto';
    textArea.style.height = '0px';
    textArea.style.height = textArea.scrollHeight + 'px';
    this.cd.detectChanges();
  }

  toggleSelectingEmoji() {
    const is = this.isShowSelectingEmoji.value;
    this.isShowSelectingEmoji.next(!is);
  }

  onSelectEmoji(key) {
    this.textarea.nativeElement.value = this.textarea.nativeElement.value + key;
    this.isDisabledSend = false;
  }

  clickOutside($event) {
    this.isShowSelectingEmoji.next(false);
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
