import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupLandingModel } from 'src/models/group-landing.model';
import { AppConfig } from 'src/app/app.config';
import { Store, select } from '@ngrx/store';
import { map, first, filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { GroupLatestMessage } from 'src/models/group-latest-message.model';
import { PremiumService } from 'src/app/services/premium.service';

@Component({
  templateUrl: './landing-groups.component.html',
  styleUrls: ['./landing-groups.component.scss']
})
export class LandingGroupsComponent implements OnInit {

  topNewGroups: GroupLandingModel[] = [];
  latestGroupMessages: GroupLatestMessage[] = [];
  myProfile$ = new BehaviorSubject<MemberProfileModel>(null);

  isEmptyGroup: boolean;
  isEmptyMessage: boolean;
  isViewAllButton = false;
  isShowRecentMember: boolean;
  nameUser: string;
  scrollPosition: number;

  constructor(
    titleService: Title,
    translateService: TranslateService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private appConfig: AppConfig,
    private premiumService: PremiumService,
    private ren: Renderer2,
  ) {
    const title = translateService.instant('Web-Group.START-PAGE.title', {
      screen_name: this.appConfig.config.myProfile.screenName
    });
    titleService.setTitle(title);

    this.premiumService.premiumInPage.next(true);
    this.myProfile$.next(this.appConfig.config.myProfile as MemberProfileModel);
    this.nameUser = this.myProfile$.value.screenName;

    this.actRoute.data.subscribe(dataResolver => {
      if (dataResolver) {
        this.topNewGroups = [...dataResolver.data];
        if (this.topNewGroups.length >= 5) {
          this.isViewAllButton = true;
          this.topNewGroups.pop();
        }
        this.latestGroupMessages = dataResolver.latestMsg;
      }

      if (this.topNewGroups.length > 0) {
        this.isEmptyGroup = false;
      } else {
        this.isEmptyGroup = true;
      }

      if (this.latestGroupMessages.length > 0) {
        this.isEmptyMessage = false;
      } else {
        this.isEmptyMessage = true;
      }

    }, err => console.log(err));

    const { activeMembers } = this.actRoute.snapshot.queryParams;
    if (activeMembers) {
      this.isShowRecentMember = true;
    }
  }

  ngOnInit(): void {

  }


  viewAllGroup() {
    this.router.navigate(['your-groups'], { relativeTo: this.actRoute });
  }

  gotoDiscoverPage() {
    this.router.navigate(['discover-groups'], { relativeTo: this.actRoute });
  }

  goToMyInbox() {
    this.router.navigate([`${this.myProfile$.value.culture}/chat`]);
  }

  showRecentMember() {
    this.isShowRecentMember = true;
    this.scrollPosition = window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';
  }

  closeRecentMember($event) {
    this.isShowRecentMember = $event;
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    window.scrollTo(0, this.scrollPosition);
  }
}
