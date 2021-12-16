import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/app.config';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { WebSocketService } from 'src/app/services/websocket.service';
import { MemberModel } from 'src/models/member.model';

@Component({
  selector: 'app-list-member-item',
  templateUrl: './list-member-item.component.html',
  styleUrls: ['./list-member-item.component.scss']
})
export class ListMemberItemComponent implements OnInit {

  @Input() memberProfile: MemberModel;
  @Input() isFollowing;
  @Input() myProfile: MemberProfileModel;
  @Output() disableShow = new EventEmitter();


  constructor(
    private route: Router,
    private appConfig: AppConfig,
    private ws: WebSocketService
  ) {}

  ngOnInit(): void {
  }

  gotoMemberProfile() {
    this.disableShow.emit(false);
    setTimeout(() => {
      this.route.navigateByUrl(`${this.appConfig.config.culture}/members/${this.memberProfile.publicId}`);
    }, 250);
  }

  sendHiveFive() {
    const message = {
      conversationType: 'One',
      referenceId: this.memberProfile.id,
      senderId: this.myProfile.id,
      senderGuid: this.myProfile.publicId,
      senderName: this.myProfile.screenName,
      senderPhoto: this.myProfile.avatarUrl,
      source: 'TPD',
    };
    this.memberProfile = { ...this.memberProfile, isHighFive: true };
    // this.listMember = this.listMember.map(obj => obj.userId == referenceId ? { ...obj, isHighFive:true } : obj);
    this.ws.sendHighFive(message);
  }
}
