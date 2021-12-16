import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { share } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfig,
    private handler: HttpBackend
  ) { }

  getMessageSetting() {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/MessageSetting/get`);
  }

  getListConversation(tick = 0, category = 'Inbox', pageSize = '20') {
    return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/Conversation/get-list-conversation`, {
      params: {
        countryCode: this.appConfig.config.country,
        languageCode: this.appConfig.config.language,
        pageSize,
        tick: String(tick),
        category: category
      }
    }).pipe(share());
  }

  getConversationInfomation(conversationId) {
    const httpClient = new HttpClient(this.handler);

    return httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/Conversation/get-conversation-information`, {
      params: {
        conversationId: conversationId,
        countryCode: this.appConfig.config.country,
        languageCode: this.appConfig.config.language,
      },
      headers: {
        Authorization: `Bearer ${this.appConfig.config.accessToken}`
      }
    });
  }

  getMessageDetails(params) {
    // console.log('%c⧭', 'color: #e57373', this.appConfig.config.deviceType$.value);
    const httpClient = new HttpClient(this.handler);
    return httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/Message/${params.category === 'Deleted' ? 'conversation-deleted-messages' : 'conversation-messages'}`, {
      params: params,
      headers: {
        Authorization: `Bearer ${this.appConfig.config.accessToken}`
      }
    }).pipe(share());
  }

  lazyLoadMessageDetails(params) {
    const httpClient = new HttpClient(this.handler);
      return httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/Message/${params.category === 'Deleted' ? 'conversation-deleted-messages' : 'conversation-messages'}`, {
        params: params,
        headers: {
          Authorization: `Bearer ${this.appConfig.config.accessToken}`
        }
      }).pipe(share());
  }

  getUnReadMessage(params) {
    const httpClient = new HttpClient(this.handler);
    return httpClient.get(`${this.appConfig.getApiUrls()}/v1/message/UnreadMessage/get`,
      {
        params: params,
        headers: {
          Authorization: `Bearer ${this.appConfig.config.accessToken}`
        }
      }
    );
  }

  toggleFavouriteConversation(params) {
    const httpClient = new HttpClient(this.handler);
    return httpClient.put(`${this.appConfig.getApiUrls()}/v1/message/Conversation/star-or-unstar`, {}, {
      params: params,
      headers: {
        Authorization: `Bearer ${this.appConfig.config.accessToken}`
      }
    });
  }

  deleteConversation({ conversationId }) {
    if (conversationId) {
      // return of({});
      const options = { body: { conversationId } };
      return this.httpClient.request('delete', `${this.appConfig.getApiUrls()}/v1/message/Conversation/delete`, {
        body: {
          conversationId
        },
        responseType: 'json'
      });
    }
  }

  restoreConversation(conversationId: string) {
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/message/Conversation/restore`, {
      conversationId
    });
  }

  blockConversation(conversationId: string) {
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/message/Conversation/block`, {
      conversationId
    });
  }

  unblockUser(ConversationId: string) {
    return this.httpClient.post(`${this.appConfig.getApiUrls()}/v1/message/Conversation/unblock`, {
      ConversationId,
      IsUnblocked: true
    });
  }
}
