import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { take, takeLast } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/app.config';
import { DeviceTypes } from 'src/app/const.enum';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { GroupRecentMessageDetail } from 'src/models/group-recent-message-detail.model';

@Component({
  selector: 'app-recent-message-item',
  templateUrl: './recent-message-item.component.html',
  styleUrls: ['./recent-message-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentMessageItemComponent implements OnInit, AfterViewInit {

  @ViewChild('truncateText') truncateText: ElementRef;
  @ViewChild('readMoreText') readMoreText: ElementRef;
  @ViewChild('readLessText') readLessText: ElementRef;

  // @Input() groupName;
  // @Input() messageText;
  // @Input() newMessageNumber = 0;
  // @Input() srcAvatar;
  // @Input() messeger;
  // @Input() sentOn;
  // @Input() sentOnType;
  // @Input() urlPathSport;
  // @Input() urlPathCity;
  // @Input() conversationId;
  // @Input() userPublicId;
  @Input() recentMessage: GroupRecentMessageDetail;

  limitRow: number;
  myProfile: MemberProfileModel;
  // activeMediaQuery = '';

  constructor(
    private ren: Renderer2,
    private router: Router,
    private appConfig: AppConfig,
    private detectDevice: DetectDeviceService
  ) {
    this.myProfile = this.appConfig.config.myProfile;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const scrollHeight = this.truncateText.nativeElement.scrollHeight;
    const maxRows = Math.round(scrollHeight / 27); // height: 27px == 1 row; include SPACE;

    if (this.appConfig.config.deviceType$.value === DeviceTypes.desktop) {
      this.limitRow = 2;
    } else {
      this.limitRow = 5;
    }

    if (maxRows > this.limitRow) {
      this.ren.addClass(this.truncateText.nativeElement, 'crop-text');
      this.ren.addClass(this.readMoreText.nativeElement, 'd-block');
    }
  }

  readMore() {
    this.ren.removeClass(this.truncateText.nativeElement, 'crop-text');

    this.ren.removeClass(this.readMoreText.nativeElement, 'd-block');
    this.ren.addClass(this.readLessText.nativeElement, 'd-block');
  }

  readLess() {
    this.ren.addClass(this.truncateText.nativeElement, 'crop-text');

    this.ren.addClass(this.readMoreText.nativeElement, 'd-block');
    this.ren.removeClass(this.readLessText.nativeElement, 'd-block');
  }

  gotoDetailGroup() {
    this.router.navigateByUrl(`${this.appConfig.config.culture}/group/${this.recentMessage.urlPathSport}/${this.recentMessage.urlPathCity}`);
  }

  gotoFullProfile() {
    if (this.myProfile.publicId !== this.recentMessage.senderGuid && (this.recentMessage.isSenderWasDeleted === false)) {
      this.router.navigateByUrl(`${this.appConfig.config.culture}/members/${this.recentMessage.senderGuid}`);
    }
  }

  joinConerstation() {
    this.router.navigate([`${this.appConfig.config.culture}/chat/${this.recentMessage.conversationId}`]);
  }
}
