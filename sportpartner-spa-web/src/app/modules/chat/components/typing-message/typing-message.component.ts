import { AppConfig } from 'src/app/app.config';
import {
  Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit,
  ElementRef, ViewChild, ChangeDetectorRef, Output, EventEmitter, OnDestroy
} from '@angular/core';
import { fromEvent, BehaviorSubject, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { DeviceTypes } from 'src/app/const.enum';

@Component({
  selector: 'app-typing-message',
  templateUrl: './typing-message.component.html',
  styleUrls: ['./typing-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypingMessageComponent implements OnInit, AfterViewInit, OnDestroy {

  deviceType = this.appConfig.config.deviceType$;

  @Input() disableChatEmoji$ = new BehaviorSubject<boolean>(false);

  @Input() autoFocus;

  @Output() sentMessage = new EventEmitter<string>(true);

  @Output() blurInput = new EventEmitter<any>(true);

  @Output() focusInput = new EventEmitter<any>(false);

  @ViewChild('textarea') textarea: ElementRef;

  destroy = new Subject();

  isDisabledSend = false;

  isShowSelectingEmoji = new BehaviorSubject<boolean>(false);

  /* emojiIcons = {
    '&#128514;': 'joy.png',
    '&#128516;': 'smile.png',
    '&#128525;': 'heart_eyes.png',
    '&#128540;': 'stuck_out_tongue_winking_eye.png',
    '&#128077;': 'like.png',
    '&#128074;': 'facepunch.png',
    '&#128075;': 'wave.png',
  }; */

  emojiIcons = [
    { key: '😂', img: 'joy.png' },
    { key: '😄', img: 'smile.png' },
    { key: '😍', img: 'heart_eyes.png' },
    { key: '😜', img: 'stuck_out_tongue_winking_eye.png' },
    { key: '👍', img: 'like.png' },
    { key: '👊', img: 'facepunch.png' },
    { key: '👋', img: 'wave.png' }
  ];

  constructor(
    private cd: ChangeDetectorRef,
    private appConfig: AppConfig) {

  }

  ngOnInit(): void {
    this.disableChatEmoji$.pipe().subscribe(value => {
      if (this.isShowSelectingEmoji.value) {
        this.isShowSelectingEmoji.next(false);
      }
    });
  }

  ngAfterViewInit() {
    fromEvent(this.textarea.nativeElement, 'keyup').subscribe(keyValue => {
      this.isDisabledSend = !(this.textarea.nativeElement.value.length > 0);
      this.updateInputHeight();
    });

    if (this.autoFocus) {
      this.textarea.nativeElement.focus();
    }
  }

  onBlurInput() {
    this.blurInput.emit(false);
  }

  onFocusInput() {
    this.focusInput.emit(true);
  }

  onKeydownEnter(event) {
    if (this.deviceType.value === DeviceTypes.desktop) {
      event.preventDefault();
      if (!this.isDisabledSend) {
        this.sendMessage();
      }
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
