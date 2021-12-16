import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';

import { AppConfig } from 'src/app/app.config';
import { GroupDetailModel } from 'src/models/group-detail.model';

@Component({
  templateUrl: './your-groups.component.html',
  styleUrls: ['./your-groups.component.scss'],
  animations: [
    trigger('LoadMoreBtn', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.5s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class YourGroupsComponent implements OnInit {

  allMyGroup = [];

  yourGroup: Array<GroupDetailModel> = [];

  ortherGroup = [];

  @ViewChild('yourOrtherGroup') yourOrtherGroup: ElementRef;
  isShowLoadMore = true;
  typeDevice: string;
  heightShowGroupCard: number;

  constructor(
    titleService: Title,
    translateService: TranslateService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private appConfig: AppConfig,
  ) {
    // const title = translateService.instant('Web-Group.YOUR-GROUPS.title');
    // titleService.setTitle(title);

    translateService.get('Web-Group.YOUR-GROUPS.title').subscribe(value => {
      titleService.setTitle(value);
    });

    this.actRoute.data.subscribe(dataResolver => {
      // console.log('array', Array<YourGroupModel>(dataResolver.data).splice(0, 4));
      if (dataResolver) {
        this.allMyGroup = [...dataResolver.data];
        if (this.allMyGroup.length === 0) {
          this.router.navigate([`/${this.appConfig.config.culture}/group`]);
        } else {
          this.yourGroup = this.allMyGroup.splice(0, 4);
          this.ortherGroup = this.allMyGroup.splice(0, 4);
          // console.log('array yourGroup', this.yourGroup);
          if (this.allMyGroup.length === 0) {
            this.isShowLoadMore = false;
          }
        }
      }
    });
  }

  ngOnInit(): void { }

  loadMoreYourGroup() {
    this.ortherGroup.push(...this.allMyGroup.splice(0, 4));
    if (this.allMyGroup.length === 0) {
      this.isShowLoadMore = false;
    }
  }

}
