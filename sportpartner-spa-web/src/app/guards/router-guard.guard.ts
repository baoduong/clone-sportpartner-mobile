
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot, Router, NavigationEnd } from '@angular/router';
import { AppConfig } from '../app.config';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RouterGuard implements CanActivateChild {
  constructor(private appConfig: AppConfig, private router: Router) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const urlCulture = route.params.culture;
    if (urlCulture !== this.appConfig.config.culture) {
      const path = route.routeConfig.path;
      this.router.navigateByUrl(`${this.appConfig.config.culture}/${path}`);
      return false;
    }
    return true;
  }
}
