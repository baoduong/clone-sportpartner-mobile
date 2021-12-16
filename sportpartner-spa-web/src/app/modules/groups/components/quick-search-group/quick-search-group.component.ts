import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Component, OnInit, Renderer2, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';

import { Router } from '@angular/router';
import { AppConfig } from 'src/app/app.config';
import { RouterStateService } from 'src/app/services/router-state.service';
import { DeviceTypes } from 'src/app/const.enum';

@Component({
  selector: 'app-quick-search-group',
  templateUrl: './quick-search-group.component.html',
  styleUrls: ['./quick-search-group.component.scss'],
  animations: [
    trigger('ShowHide', [
      state('show', style({
        minWidth: '40px',
        opacity: 1,
        width: '40px',
        marginLeft: '20px'
      })),
      state('hide', style({
        minWidth: 0,
        opacity: 0,
        width: 0,
        marginLeft: 0,
      })),
      transition('* <=> *', [
        animate('0.3s')
      ])
    ]),
  ]
})
export class QuickSearchGroupComponent implements OnInit {
  @Input() isShowBackButton = false;
  previousUrl = '';
  // isShow = false;
  toogleShow = new BehaviorSubject(false);
  isShow = false;
  constructor(
    private ren: Renderer2,
    private detectDevice: DetectDeviceService,
    private routerStateService: RouterStateService,
    private router: Router,
    private appConfig: AppConfig) {
  }

  ngOnInit(): void {
    this.toogleShow.asObservable().subscribe($isShow => {
      this.isShow = $isShow;
      if ($isShow && this.appConfig.config.deviceType$.value === DeviceTypes.mobile) {
        this.ren.addClass(document.body, 'overflow-hidden');
      } else {
        this.ren.removeClass(document.body, 'overflow-hidden');
      }
    });
  }

  hide() {
    this.toogleShow.next(false);
  }

  show() {
    this.toogleShow.next(true);
  }

  back() {
    // this.router.navigate([`/${this.appConfig.config.culture}/group`]);
    // window.history.back();
    this.router.navigate([`${this.routerStateService.getPreviousUrl()}`]);
  }
}
