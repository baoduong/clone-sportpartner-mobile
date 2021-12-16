import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class StartGroupCookieService {
  constructor(private cookieService: CookieService) { }

  get isAcceptCookieStartGroup() {
    return this.cookieService.check('ACCEPTED_COOKIE_START_GROUP');
  }
}
