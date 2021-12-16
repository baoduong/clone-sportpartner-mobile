import { AppConfig } from 'src/app/app.config';
import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, tap, takeUntil } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { trigger, transition, query, style, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { DeviceTypes } from 'src/app/const.enum';

@Component({
  selector: 'app-shares-link',
  templateUrl: './shares-link.component.html',
  styleUrls: ['./shares-link.component.scss'],
  animations: [
    trigger('showNotification', [
      transition(':enter', [
        style({ height: 0, opacity: 0, marginTop: 0, overflow: 'hidden' }), // From
        animate('0.3s 0.3s ease-in', style({ height: '*', opacity: 1, marginTop: '10px' })), // to
      ])
    ]),
    trigger('changeButtonState', [
      transition(':enter', [
        style({ opacity: 0, position: 'absolute' }), // From
        animate('0.3s 0.3s ease-in', style({ opacity: 1 })), // to
      ]),
      transition(':leave', [
        style({ opacity: 1, position: 'absolute' }), // From
        animate('0.3s ease-out', style({ opacity: 0 })), // to
      ])
    ])
  ]
})
export class SharesLinkComponent implements OnInit, AfterViewInit, OnDestroy {
  contentIconItems = [
    {
      icon: 'icon-medium-line-share',
      title: 'Web-Group.INVITATION-OVERLAY.guide_tip1_title',
      description: 'Web-Group.INVITATION-OVERLAY.guide_description1_title'
    },
    {
      icon: 'icon-medium-line-members',
      title: 'Web-Group.INVITATION-OVERLAY.guide_tip2_title',
      description: 'Web-Group.INVITATION-OVERLAY.guide_description2_title'
    },
    {
      icon: 'icon-medium-line-gift',
      title: 'Web-Group.INVITATION-OVERLAY.guide_tip3_title',
      description: 'Web-Group.INVITATION-OVERLAY.guide_description3_title'
    }
  ];

  @ViewChild('whatsAppButton') whatsAppButton: ElementRef;
  @ViewChild('mobileStickyWhapsApp') mobileStickyWhapsApp: ElementRef;

  isCopied = false;
  isCopied2 = false;
  deviceType = this.appConfig.config.deviceType$;
  shareLink = '';
  destroy = new Subject();

  constructor(
    private appConfig: AppConfig,
    titleService: Title,
    translateService: TranslateService,
    private ren: Renderer2,
    private clipboard: Clipboard,
    private actRoute: ActivatedRoute,
    private toggleNavigationBarService: ToggleNavigationBarService,
    detectDevice: DetectDeviceService
  ) {
    // const title = translateService.instant('Web-Group.INVITATION-OVERLAY.title');
    // titleService.setTitle(title);

    translateService.get('Web-Group.INVITATION-OVERLAY.title').subscribe(value => {
      titleService.setTitle(value);
    });

    this.actRoute.data
      .subscribe(dataResolver => {
        if (dataResolver) {
          this.shareLink = dataResolver.data;
        } else {
          this.shareLink = '';
        }

      }, err => { console.log('error', err); });
  }

  ngOnInit(): void {
    // window.scrollTo(0, 0);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.toggleNavigationBarService.isShowNavigationBar.next(false);
      const positionButton = this.whatsAppButton.nativeElement.offsetTop;
      fromEvent(window, 'scroll')
        .pipe(
          takeUntil(this.destroy),
          debounceTime(300),
          tap(() => {
            if (positionButton < window.pageYOffset) {
              this.ren.addClass(this.mobileStickyWhapsApp.nativeElement, 'doSticky');
            } else {
              this.ren.removeClass(this.mobileStickyWhapsApp.nativeElement, 'doSticky');
            }
          })
        ).subscribe(ev => { });
    }, 500);
  }

  ngOnDestroy() {
    this.toggleNavigationBarService.isShowNavigationBar.next(true);
  }

  copyLink() {
    this.clipboard.copy(this.shareLink);
    this.isCopied = true;
  }

  shareByFB() {
    const link = encodeURIComponent(this.shareLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, '_blank');
  }

  shareByWhatsApp() {
    const link = encodeURIComponent(this.shareLink);
    if (this.deviceType.value === DeviceTypes.desktop) {
      window.open(`https://web.whatsapp.com/send?text=${link}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${link}`, '_blank');
    }
  }
}
