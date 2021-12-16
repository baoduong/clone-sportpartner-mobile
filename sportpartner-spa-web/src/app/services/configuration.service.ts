import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  constructor(private httpClient: HttpClient, handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }
  getAppSettings() {
    return this.httpClient.get('/spa-web/configuration/app-settings');
  }
}
