import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CONTAINER_DATA } from '../container_data.sidenav';

@Component({
  selector: 'app-avatar-navigation',
  templateUrl: './avatar-navigation.component.html',
  styleUrls: ['./avatar-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarNavigationComponent implements OnInit {

  userProfile: any;
  user_type: string;

  constructor(
    @Inject(CONTAINER_DATA) public componentData: any,
    translate: TranslateService
  ) {
    this.userProfile = componentData.profile;
    this.user_type = translate.instant(this.userProfile.isPremium ? 'Generic.MENU.premium_member' : 'Generic.MENU.basic_member');
  }

  ngOnInit(): void {
  }
}
