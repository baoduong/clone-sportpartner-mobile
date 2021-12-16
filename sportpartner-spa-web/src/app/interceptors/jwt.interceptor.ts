import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { AppConfig } from '../app.config';
import { AccessTokenService } from '../services/access-token.service';
import { catchError, take, filter, switchMap } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  isRefreshToken = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private appConfig: AppConfig,
    private accessTokenservice: AccessTokenService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.appConfig.getConfig('accessToken');
    request = this.addToken(request, accessToken);

    return next.handle(request).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          return this.handle401Error(request, next);
        }
        const error = err.error.message || err.statusText;
        return throwError(error);
      }),
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    const culture = this.appConfig.getConfig('culture');
    if (!this.isRefreshToken) {
      this.isRefreshToken = true; // Flag: refresh Token done!
      this.refreshTokenSubject.next(null);

      return this.accessTokenservice.refreshToken().pipe(
        switchMap((newAccessToken: any) => {
          this.isRefreshToken = false;
          this.appConfig.config.accessToken = newAccessToken.accessToken;
          this.refreshTokenSubject.next(newAccessToken.accessToken);
          request = this.addToken(request, newAccessToken.accessToken);
          return next.handle(request);
        }));
    } else {
      window.location.href = `/${culture}/account/login`;
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }
}
