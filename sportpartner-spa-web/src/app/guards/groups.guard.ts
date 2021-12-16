import { AppConfig } from './../app.config';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GroupGuard implements CanActivate {

    constructor(private appConfig: AppConfig, private router: Router) { }

    canActivate() {
        if (this.appConfig.config.isShowGroupFeature) {
            return this.appConfig.config.isShowGroupFeature;
        }
        window.location.href = window.location.origin + `/${this.appConfig.config.culture}/matches`;
        return false;
    }
}
