import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    constructor(
        private httpClient: HttpClient,
        private appConfig: AppConfig
    ) {}

    getStatusNotification(userPublicId) {
        return this.httpClient.get(`${this.appConfig.getApiUrls()}/v1/scheduler/Notification/get-count`, {
            params: {
                publicId: userPublicId
            }
        });
    }

    markReadNotification(userPublicId) {
        return this.httpClient.put(`${this.appConfig.getApiUrls()}/v1/scheduler/Notification/reset-count`, null, {
            params: {
                publicId: userPublicId
            }
        });
    }
}
