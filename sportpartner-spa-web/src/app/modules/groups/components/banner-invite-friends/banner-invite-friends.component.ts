import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-banner-invite-friends',
  templateUrl: './banner-invite-friends.component.html',
  styleUrls: ['./banner-invite-friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerInviteFriendsComponent implements OnInit {
  @Input() noBorder = false;
  @Input() GroupId: number;
  @Input() styleMobile;
  @Input() styleDesktop;

  constructor(private router: Router, private route: ActivatedRoute, private appConfig: AppConfig) { }

  ngOnInit(): void {
  }

  inviteFriends() {
    this.router.navigate([`${this.appConfig.config.culture}/shares`], {
      // relativeTo: this.route,
      queryParams: {
        countryCode: this.appConfig.config.country,
        groupId: this.GroupId
      }
    });
  }

}
