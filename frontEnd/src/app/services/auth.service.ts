import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import * as JWT from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import {User} from '../model/user.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NavController} from '@ionic/angular';
import {FacebookLogin} from '@rdlabo/capacitor-facebook-login';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public expiry: any;
  public id: string;
  public url = environment.apiUrl + '/api/authentication/';
  public notificationUrl = environment.apiUrl + '/api/notification/';

  private profileData = new Array();
  private activeProfileData;
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  constructor(public http: HttpClient, public router: Router,
              private navController: NavController) {
    this.currentUserSubject = new BehaviorSubject<User>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  getProfileData() {
        return this.activeProfileData;
    }
  pushProfileData(data) {
        this.profileData.push(data);
        this.activeProfileData = data;
    }
  popProfileData() {
        this.profileData.pop();
        this.activeProfileData = this.profileData[this.profileData.length - 1];
  }
  getNotificationsCount(data, jwt) {
      return this.http
          .post<any>(this.notificationUrl + 'getNotificationsCount', data, {
              headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json',
                  Authorizations: jwt
              })
          });
  }
  getNotifications(data, jwt) {
      return this.http
          .post<any>(this.notificationUrl + 'getNotifications', data, {
              headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json',
                  Authorizations: jwt
              })
          });
  }
  changeProfileImage(data, jwt) {
      return this.http.post<{data: any}>(`https://sorrowflush.valuecreatives.com/api/users/change_profile_picture`, data, {
          headers: new HttpHeaders({
              'X-API-KEY': 'amandeep',
              Authorizations: jwt
          })});
  }
  thirdPartyLogin(data) {
      return this.http
          .post<any>(this.url + 'thirdPartyLogin', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json'})
      })
      .pipe(
          tap(res => {
              if (res.status) {
                  const a = JWT(res.data.jwt);
                  console.log('jwt verify');
                  console.log(a);
                  console.log(JSON.stringify(a));
                  this.expiry = a.exp;
                  localStorage.setItem('n', JSON.stringify(res.data));
                  localStorage.setItem('aaa', JSON.stringify(a));
                  localStorage.setItem('access_token', res.data.jwt);
                  this.currentUserSubject.next(res.data);
              }
          })
      );
  }

  public get loggedIn(): boolean {
    return localStorage.getItem('access_token') != null;
  }
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  login(data) {
    return this.http
        .post<any>(this.url + 'login', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep', 'Content-Type': 'application/json'})
        })
        .pipe(
            tap(res => {
              if (res.status) {
                const a = JWT(res.data.jwt);
                this.expiry = a.exp;
                localStorage.setItem('n', JSON.stringify(res.data));
                localStorage.setItem('aaa', JSON.stringify(a));
                localStorage.setItem('access_token', res.data.jwt);
                this.currentUserSubject.next(res.data);
              }
            })
        );
  }
  register(data) {
    return this.http
        .post<any>(this.url + 'registration', data, {
          headers: new HttpHeaders({ 'X-API-KEY': 'amandeep' })
        })
        .pipe(
            tap(
                res => {
                  this.login(data);
                  console.log('registered');
                },
                error => {}
            )
        );
  }
  public exp() {
    const a = new Date(this.expiry * 1000);
    const b = new Date();

    if (a > b) {
      return true;
    } else {
      return false;
    }
  }
  logout() {
    localStorage.removeItem('aaa');
    localStorage.removeItem('n');
    localStorage.removeItem('access_token');
    localStorage.removeItem('post');
    this.currentUserSubject.next(null);
    // await FacebookLogin.logout();
    this.navController.navigateBack(['login']);
  }
}
