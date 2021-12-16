import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { of } from 'rxjs';
import { share, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private httpClient: HttpClient, private appConfig: AppConfig) { }

  getTopLandingGroup(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/get-group-cards`, {
      params: param
    });
  }

  getGroupDetail(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/details`, {
      params: param
    });
  }

  getGroupDetailById(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/detail-by-id`, {
      params: param
    });
  }

  joinOrUnJoinGroup(body) {
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/group/Group/join-or-unjoin`, body);
  }

  getListMemberGroup(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/group-members`, {
      params: param
    }).pipe(shareReplay());
  }

  updateLastSeen(param) {
    return this.httpClient.put(`${this.appConfig.getApiUrls()}/v1/group/Group/update-member-last-seen`, null, {
      params: param
    });
  }

  getLatestGroupMessage(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/Conversation/get-latest-message-groups`, {
      params: param
    });
  }

  getRecentMessageGroupDetail(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/Message/group-recent-messages`, {
      params: param
    });
  }

  getAllYourGroup(param) {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/get-my-groups`, {
      params: param
    });
  }

  getDiscoverGroupItem(params) {
    return of([
      {
        'groupId': 1,
        'sportId': 1, 'cityId': 1,
        'sportName': 'Dancing',
        'cityName': 'Randers',
        'groupName': 'Dancing Randers',
        'backgroundImage':
          'https://files.sportpartner-staging.test.infodation.vn/assets/images/groups/sportpartner-photography-desktop-walking-3.jpg',
        'mobileBackgroundImage': null,
        'totalMember': 18,
        'totalMessage': 20,
        'url': 'http://frontend.infodationdev.com/group/dancing/copenhagen',
        'urlPathCity': 'copenhagen',
        'urlPathSport': 'dancing'
      },
      {
        'groupId': 1,
        'sportId': 1, 'cityId': 1,
        'sportName': 'Dancing',
        'cityName': 'Randers',
        'groupName': 'Dancing Randers',
        'backgroundImage':
          'https://files.sportpartner-staging.test.infodation.vn/assets/images/groups/sportpartner-photography-desktop-walking-3.jpg',
        'mobileBackgroundImage': null,
        'totalMember': 18,
        'totalMessage': 20,
        'url': 'http://frontend.infodationdev.com/group/dancing/copenhagen',
        'urlPathCity': 'copenhagen',
        'urlPathSport': 'dancing'
      },
      {
        'groupId': 1,
        'sportId': 1, 'cityId': 1,
        'sportName': 'Dancing',
        'cityName': 'Randers',
        'groupName': 'Dancing Randers',
        'backgroundImage':
          'https://files.sportpartner-staging.test.infodation.vn/assets/images/groups/sportpartner-photography-desktop-walking-3.jpg',
        'mobileBackgroundImage': null,
        'totalMember': 18,
        'totalMessage': 20,
        'url': 'http://frontend.infodationdev.com/group/dancing/copenhagen',
        'urlPathCity': 'copenhagen',
        'urlPathSport': 'dancing'
      },
      {
        'groupId': 1,
        'sportId': 1, 'cityId': 1,
        'sportName': 'Dancing',
        'cityName': 'Randers',
        'groupName': 'Dancing Randers',
        'backgroundImage':
          'https://files.sportpartner-staging.test.infodation.vn/assets/images/groups/sportpartner-photography-desktop-walking-3.jpg',
        'mobileBackgroundImage': null,
        'totalMember': 18,
        'totalMessage': 20,
        'url': 'http://frontend.infodationdev.com/group/dancing/copenhagen',
        'urlPathCity': 'copenhagen',
        'urlPathSport': 'dancing'
      }
    ]);
  }

  getRecentMemberGroupId() {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/get-my-group-ids`);
  }

  getRecentMemberGroupItem(payload) {
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/group/Group/get-recent-members`, payload.body, {
      params: payload.params
    });
  }

  getDiscoveredGroupIds() {
    // /v1/group/Group/discovered-group-ids
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/group/Group/discovered-group-ids`);
  }

  getGroupsByIds(param, ids) {
    // /v1/group/Group/get-many
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/group/Group/get-many`, [...ids], {
      params: param
    });
  }
}
