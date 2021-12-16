import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  constructor(private http: HttpClient, handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  accessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get('/spa-web/authentication/get-token')
        .subscribe(tokenRes => {
          if (tokenRes) {
            resolve(tokenRes['accessToken']);
          }
          reject('');
        },
          error => {
            console.log('Can not get the new Access Token', error);
            reject(error);
          });
    });
  }

  refreshToken() {
    return this.http.get('/spa-web/authentication/get-token');
  }
}
