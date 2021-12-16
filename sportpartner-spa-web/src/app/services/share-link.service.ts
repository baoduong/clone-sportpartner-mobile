import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ShareLinkService {

  constructor(private httpClient: HttpClient, private appConfig: AppConfig) { }

  getSharesLink(param) {
    // const { userId, countryCode, city, sport, groupId } = param;
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Invitation/get-invitation-url`, {
      params: param
    });
  }
}
