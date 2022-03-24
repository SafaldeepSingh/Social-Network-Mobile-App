import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  Url = environment.apiUrl + '/api/users/';
  followUrl = 'https://sorrowflush.valuecreatives.com/api/follow/';

  private followData = new Array();
  private activeFollowData;
  constructor(private http: HttpClient) {}

  getfollowData() {
    return this.activeFollowData;
  }
  pushfollowData(data) {
    this.followData.push(data);
    this.activeFollowData = data;
  }
  popfollowData() {
    this.followData.pop();
    this.activeFollowData = this.followData[this.followData.length - 1];
  }

  followuser(data, jwt) {
    return this.http.post(this.Url + 'follow', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  userprofiledetails(data, jwt) {
    return this.http.post(this.Url + 'userprofile', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  profileimage(data , jwt) {
    return this.http.post(this.Url + 'change_profile_picture', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
}
