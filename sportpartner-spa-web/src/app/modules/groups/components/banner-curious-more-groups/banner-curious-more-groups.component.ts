import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-banner-curious-more-groups',
  templateUrl: './banner-curious-more-groups.component.html',
  styleUrls: ['./banner-curious-more-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerCuriousMoreGroupsComponent implements OnInit {

  constructor(
    private router: Router,
    private appConfig: AppConfig,
  ) { }

  ngOnInit(): void {
  }

  gotoDiscoverPage() {
    this.router.navigate([`${this.appConfig.config.culture}/group/discover-groups`]);
  }

}
