import { share } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // apiGateway = environment.apiGateway;
  // appConfig: AppConfig;
  constructor(
    private httpClient: HttpClient,
    private handler: HttpBackend,
    private appConfig: AppConfig) { }

  getRecentMemberAvatar(topUserId: Array<any>) {
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/profile/Member/get-recent-member-avatar`, {
      memberIds: topUserId
    });
  }

  getMemberProfile(params) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/profile/Member/get-profile`, {
      params: params
    }).pipe(
      share()
    );
  }

  getMemberProfileFromChatDetail(params) {
    const _httpClient = new HttpClient(this.handler);
    return _httpClient.get(`${this.appConfig.getApiUrls()}/v1/profile/Member/get-profile`, {
      params: params,
      headers: {
        Authorization: `Bearer ${this.appConfig.config.accessToken}`
      }
    });
  }

  getMyProfile() {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/profile/Member/get-my-profile`);
  }

  toggleFavorite(params) {
    return this.httpClient.put(`${this.appConfig.getApiUrls()}/v1/profile/MatchesInteraction/favorite`, params);
  }
}
