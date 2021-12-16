import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StartGroupCookieService } from '../services/start-group-cookie.service';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class StartGroupGuard implements CanActivate {
  constructor(private startGroupCookieService: StartGroupCookieService, private router: Router, private appConfig: AppConfig) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    // console.log('[canActivate] Run', this.appConfig.config.culture);

    // no need to show Introduce Group page!
    if (!this.appConfig.config.isShowGroupFeature) {
      return true;
    }

    if (this.startGroupCookieService.isAcceptCookieStartGroup) {
      return this.startGroupCookieService.isAcceptCookieStartGroup;
    } else {
      this.router.navigate([`/${this.appConfig.config.culture}/start-groups`], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }

}
