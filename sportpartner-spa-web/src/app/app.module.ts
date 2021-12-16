import { filter } from 'rxjs/operators';
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app.component';
import { SharedModule } from './modules/shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule, ViewportScroller } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StartGroupComponent } from './start-group/start-group.component';
import { StartGroupSliderItemComponent } from './start-group/start-group-slider-item/start-group-slider-item.component';
import { TranslateModule, TranslateLoader, TranslateService, MissingTranslationHandler } from '@ngx-translate/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { LayoutModule } from '@angular/cdk/layout';
import { DbTranslateLoader } from './modules/shared/translate/DbTransLoader.loader';
import { CookieService } from 'ngx-cookie-service';
import { StartGroupCookieService } from './services/start-group-cookie.service';

import { StoreModule } from '@ngrx/store';
import { EffectsModule, EffectsRootModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { GroupService } from './services/group.service';

import { LoaderService } from './services/loader.service';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { LoadingComponent } from './modules/shared/components/loading/loading.component';
import { AppConfig } from './app.config';
import { AccessTokenService } from './services/access-token.service';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ConfigurationService } from './services/configuration.service';
import { DBMissingTranslationHandler } from './modules/shared/translate/MissingTranslationHandler';
import { ProfileService } from './services/profile.service';

import * as SharesLinkReducer from './modules/shares-link/share-link/ngrx/shares-link.reducers';
import * as GroupReducers from './modules/groups/store/group.reducer';
import * as ProfileReducer from './modules/members/members.reducer';
import * as ChatReducer from './modules/chat/store/chat.reducer';
import * as SharedReducer from './modules/shared/store/shared.reducer';

import { TranslationService } from './services/translation.service';
import { RouterStateService } from './services/router-state.service';
import { environment } from 'src/environments/environment';
import { WebSocketService } from './services/websocket.service';
import { MessageService } from './services/message.service';
import { SharedService } from './services/shared.service';

import { SharesLinkEffects } from './modules/shares-link/share-link/ngrx/shares-link.effects';
import { GroupEffects } from './modules/groups/store/group.effect';
import { ChatEffects } from './modules/chat/store/chat.effects';
import { MembersEffects } from './modules/members/members.effect';
import { SharedEffect } from './modules/shared/store/shared.effects';

import { Router, Scroll } from '@angular/router';

import * as Hammer from 'hammerjs';

export function TranslateLoaderFactory(translationService: TranslationService) {
  return new DbTranslateLoader(translationService);
}

// making hammer config (3)
export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: {direction: Hammer.DIRECTION_ALL },
  };
  buildHammer(element: HTMLElement) {
    const mc = new Hammer(element, {
      touchAction: 'pan-y'
    });
    return mc;
  }
}

@NgModule({
      declarations: [
    AppComponent,
    StartGroupComponent,
    StartGroupSliderItemComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule,
    BrowserModule.withServerTransition({appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    OverlayModule,
    LayoutModule,
    TranslateModule.forRoot({
      loader: {
      provide: TranslateLoader,
        // useClass: DbTranslateLoader,
        useFactory: TranslateLoaderFactory,
        deps: [TranslationService],
      },
      isolate: true,
      // defaultLanguage: 'en'
      missingTranslationHandler: {
      provide: MissingTranslationHandler,
        useClass: DBMissingTranslationHandler
      },
    }),

    StoreModule.forRoot({
      shareLinkReducer: SharesLinkReducer.reducer,
      groupReducer: GroupReducers.reducer,
      profileReducer: ProfileReducer.reducer,
      chatReducer: ChatReducer.reducer,
      sharedReducer: SharedReducer.reducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: !environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([
      SharesLinkEffects,
      GroupEffects,
      MembersEffects,
      ChatEffects,
      SharedEffect
    ]),
    EffectsRootModule,

    SharedModule.forRoot(),

    HttpClientModule,
    // AppRouting should always at the end of the import
    AppRoutingModule,
    HammerModule
  ],
  providers: [
    Title,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfig) => () => config.load(),
      deps: [AppConfig],
      multi: true
    },

    AccessTokenService,
    TranslateService,
    CookieService,
    StartGroupCookieService,
    GroupService,
    MessageService,
    ProfileService,
    ConfigurationService,
    TranslationService,
    LoaderService,
    RouterStateService,
    SharedService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },

    WebSocketService,
    {provide: 'googleTagManagerId', useValue: environment.GTM_ID },
    {provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
      constructor(router: Router, viewportScroller: ViewportScroller) {
      router.events.pipe(
        filter((e: any): e is Scroll => e instanceof Scroll)
      ).subscribe(e => {
        if (e.position) {
          // backward navigation
          viewportScroller.scrollToPosition(e.position);
        } else if (e.anchor) {
          // anchor navigation
          viewportScroller.scrollToAnchor(e.anchor);
        } else {
          // forward navigation
          viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
