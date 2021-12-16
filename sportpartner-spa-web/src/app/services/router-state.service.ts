import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppConfig } from '../app.config';

@Injectable({ providedIn: 'root' })
export class RouterStateService {
  private history = [];
  constructor(private router: Router, private appConfig: AppConfig) { }

  public loadRouting(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
      )
      .subscribe((event: NavigationStart) => {
        const { url } = event;
        this.history = [...this.history, decodeURIComponent(url)];
      });
  }

  public getHistory(): string[] {
    return this.history;
  }

  public getPreviousUrl(): string {

    const previousLink = this.history[this.history.length - 2] || `${this.appConfig.config.culture}/group`;
    this.history = this.history.slice(0, this.history.length - 2);
    return previousLink;
  }
}
