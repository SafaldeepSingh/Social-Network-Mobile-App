import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  public url = environment.apiUrl + '/api/posts/';
  public commentUrl = environment.apiUrl + '/api/comments/';
  public likeUrl = environment.apiUrl + '/api/like/';

  posts: any;
  postsSub = new BehaviorSubject(null);
  private likesModalIds = new Array();
  private activeLikeModalId;
  constructor(public http: HttpClient, public auth: AuthService) {}
// methods
  getLikeModalId() {
    return this.activeLikeModalId;
  }
  pushLikeModalId(id) {
    this.likesModalIds.push(id);
    this.activeLikeModalId = id;
  }
  popLikeModalId() {
    this.likesModalIds.pop();
    this.activeLikeModalId = this.likesModalIds[this.likesModalIds.length - 1];
  }
  addNewPost(posts) {
    this.posts.unshift(posts);
    this.postsSub.next(this.posts);
  }
  // http requests
  // add user post  input data -title,content,posttachment,id(userid) //
  createUserPost( data, jwt) {
    return this.http.post(this.url + 'add', data,
        {
          headers: new HttpHeaders({
            'X-API-KEY': 'amandeep',
            Authorizations: jwt
          })
        });
  }
  // delete user post input data  -id(userid),postid(to be deleted) //
  deleteUserPost(data, jwt) {
    return this.http
        .post<any>(this.url + 'deletepost', data, {
          headers: new HttpHeaders({
            'X-API-KEY': 'amandeep',
            Authorizations: jwt,
          })
        })
        .pipe(
            tap(res => {
              if (res.status) {
                // console.log('user post deleted');
              }
            })
        );
  }
  // get user post input data -id(userid) //
  getUserPost( loginUserId, userId, jwt) {
    return this.http.post<any>(this.url + 'getuserpost', { id: loginUserId, user_id: userId}, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    }).pipe(tap(res => {
      // console.log('post data');
    }));
  }
  getAllPost( id1, jwt) {
    this.http.post<any>(this.url + 'getallpost', { id: id1}, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    }).subscribe(res => {
      // console.log(res);
      if (res) {
        // console.log('Posts res');
        // console.log(JSON.stringify(res));
        this.posts = res.data;
        this.postsSub.next(res.data);
        if (!res.status) {
          this.postsSub.next(false);
        }
        // return res.status;
      }
    }, error => {
      // console.log('Posts res error');
      // console.log(JSON.stringify(error));
    });
    return this.postsSub.asObservable();
  }
  // create user comment for post input data -comment(comment text),parent_coment,user_id,post_id //
  createComment(data , jwt) {
    return this.http.post<any>(this.commentUrl + 'add', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  // get user comment for post input data -user_id(userid),post_id //
  getusercomment(data, jwt) {
    return this.http.post(this.commentUrl + 'fetch_comments', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  // get user like for post input data -user_id(userid),post_id //
  getuserlike(data, jwt) {
    return this.http.post(this.likeUrl + 'fetch_likes', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  // create user like for post input data -user_id(userid),post_id //
  adduserlike(data, jwt) {
    return this.http.post(this.likeUrl + 'add', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  addCommentlike(data, jwt) {
    return this.http.post(this.commentUrl + 'like', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
  sharePost(data, jwt) {
    return this.http.post<any>(this.url + 'share', data, {
      headers: new HttpHeaders({
        'X-API-KEY': 'amandeep',
        Authorizations: jwt
      })
    });
  }
}
