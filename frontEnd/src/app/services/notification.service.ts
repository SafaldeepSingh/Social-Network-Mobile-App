import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationUrl = environment.apiUrl + '/api/notification/';
  // private unReadNotificationsCount;
  private unReadNotificationsCountSub = new BehaviorSubject(0);
  constructor(
      private http: HttpClient
  ) { }

  getNotificationsCount(data, jwt) {
    this.http
        .post<any>(this.notificationUrl + 'getNotificationsCount', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json',
            Authorizations: jwt
          })}).subscribe(res => {
        this.unReadNotificationsCountSub.next(res.count);
    });
    return this.unReadNotificationsCountSub.asObservable();
  }
  setNotificationCount(count) {
      this.unReadNotificationsCountSub.next(count);
  }
  getNotifications(data, jwt) {
    return this.http
        .post<any>(this.notificationUrl + 'getNotifications', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json',
            Authorizations: jwt
          })
        });
  }
  confirmFollowRequest(data, jwt) {
    return this.http.post<any>(this.notificationUrl + 'confirmFollowRequest', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json',
            Authorizations: jwt
          })
        });
  }
  deleteFollowRequest(data, jwt) {
    return this.http
        .post<any>(this.notificationUrl + 'deleteFollowRequest', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json',
            Authorizations: jwt
          })
        });
  }
}
