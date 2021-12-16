import { ListMemberItemComponent } from './components/list-member-item/list-member-item.component';
import { DecodeHTMLPipe } from './decodeHTML.pipe';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule, BreakPoint, BREAKPOINT } from '@angular/flex-layout';
import { MainNavigationComponent } from './components/main-navigation/main-navigation.component';
import {
  ButtonCoral2LargeDirective,
  ButtonAzure2LargeDirective
} from './molecules/buttons/button-large.directive';
import {
  ButtonCoral2Directive,
  ButtonAzure2Directive,
  ButtonAzure6Directive,
  ButtonOutlineAzure2Directive
} from './molecules/buttons/button-medium.directive';
import { ButtonCoral2IconDirective, ButtonAzure2IconDirective } from './molecules/buttons/button-icon.directive';
import { InputRegularDirective } from './molecules/inputs/input-regular.directive';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DbTranslateLoader } from './translate/DbTransLoader.loader';
import { RouteAnimationsComponent } from './components/route-animations/route-animations.component';
import { HeadingComponent } from './components/heading/heading.component';
import { StickyTopDirective } from './sticky-top.directive';
import { PortalModule } from '@angular/cdk/portal';
import { ImageLazyLoadDirective } from './lazyload-image.directive';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { AvatarNavigationComponent } from './components/avatar-navigation/avatar-navigation.component';
import { UpgradePremiumBannerComponent } from './components/upgrade-premium-banner/upgrade-premium-banner.component';
import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { ClickOutSidetDirective } from './click-out-side.directive';
import { OverlayExpriedComponent } from './components/overlay-expried/overlay-expried.component';

/* export function HttpTranslateLoaderFactory(http: HttpClient) {
  return new DbTranslateLoader(http);
} */

const CUSTOM_BREAKPOINTS: BreakPoint[] = [
  // Phone Portrait
  {
    alias: 'xs',
    mediaQuery: 'screen and (max-width: 767px)',
    overlapping: false
  },
  {
    alias: 'sm',
    mediaQuery: 'screen and (min-width: 768px) and (max-width: 1024px)',
    overlapping: false
  },
  {
    alias: 'md',
    mediaQuery: 'screen and (min-width: 1025px) and (max-width: 1279px)',
    overlapping: false
  },
  {
    alias: 'lg',
    mediaQuery: 'screen and (min-width: 1280px)',
    overlapping: false
  },

  {
    alias: 'lt-sm',
    mediaQuery: 'screen and (max-width: 768px)',
    overlapping: false
  },
  {
    alias: 'lt-md',
    mediaQuery: 'screen and (max-width: 1023px)',
    overlapping: false
  },
  {
    alias: 'lt-lg',
    mediaQuery: 'screen and (max-width: 1279px)',
    overlapping: false
  },
  {
    alias: 'gt-xs',
    mediaQuery: 'screen and (min-width: 768px)',
    overlapping: false
  },
  {
    alias: 'gt-sm',
    mediaQuery: 'screen and (min-width: 1025px)',
    overlapping: false
  },
  {
    alias: 'gt-md',
    mediaQuery: 'screen and (min-width: 1440px)',
    overlapping: false
  },
  {
    alias: 'gt-lg',
    mediaQuery: 'screen and (min-width: 1680px)',
    overlapping: false
  }
];

@NgModule({
  declarations: [
    LayoutComponent,
    RouteAnimationsComponent,
    MainNavigationComponent,
    ButtonCoral2LargeDirective,
    ButtonAzure2LargeDirective,
    ButtonCoral2Directive,
    ButtonAzure2Directive,
    ButtonAzure6Directive,
    ButtonCoral2IconDirective,
    ButtonAzure2IconDirective,
    ButtonOutlineAzure2Directive,
    InputRegularDirective,
    StickyTopDirective,
    HeadingComponent,
    ImageLazyLoadDirective,
    SidenavComponent,
    AvatarNavigationComponent,
    UpgradePremiumBannerComponent,
    DecodeHTMLPipe,
    ClickOutSidetDirective,
    ListMemberItemComponent,
    OverlayExpriedComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule,
    FlexLayoutModule,
    TranslateModule,
    PortalModule,
    CommonModule
  ],
  exports: [
    HttpClientModule,
    TranslateModule,
    FlexLayoutModule,
    PortalModule,
    LayoutComponent,
    RouteAnimationsComponent,
    MainNavigationComponent,
    ButtonCoral2LargeDirective,
    ButtonAzure2LargeDirective,
    ButtonAzure6Directive,
    ButtonCoral2Directive,
    ButtonAzure2Directive,
    ButtonCoral2IconDirective,
    ButtonAzure2IconDirective,
    ButtonOutlineAzure2Directive,
    InputRegularDirective,
    StickyTopDirective,
    HeadingComponent,
    ImageLazyLoadDirective,
    UpgradePremiumBannerComponent,
    DecodeHTMLPipe,
    ClickOutSidetDirective,
    ListMemberItemComponent,
    OverlayExpriedComponent
  ],
  entryComponents: [
    // LayoutComponent
    LayoutComponent
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        TranslateStore,
        // share services
        {
          provide: BREAKPOINT,
          useValue: CUSTOM_BREAKPOINTS,
          multi: true
        },
        DetectDeviceService,
        DecodeHTMLPipe
      ],
    };
  }
}
