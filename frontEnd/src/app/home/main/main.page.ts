import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, PopoverController} from '@ionic/angular';
import {Plugins} from '@capacitor/core';
import {PostService} from '../../services/post.service';
import {ViewLikesComponent} from '../view-likes/view-likes.component';
import * as moment from 'moment';
import {ViewReactionsComponent} from '../view-reactions/view-reactions.component';
import {NavigationExtras, Router} from '@angular/router';
import {ShareComponent} from '../share/share.component';
import {NewPostComponent} from '../new-post/new-post.component';
import {PostSettingsComponent} from '../post-settings/post-settings.component';
import {NotificationService} from '../../services/notification.service';
import {PostImagesComponent} from '../post-images/post-images.component';
import {PagesDataService} from '../../services/pages-data.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  unReadNotificationsCount = 0;
  searchFilter;
  contents;
  likes = new Object();
  userData;
  postArray = [];
  postData: any;
  postWithAttachment = [];
  postWithComment = [];
  refresherTarget;
  constructor(
      private router: Router,
      private navController: NavController,
      private notificationService: NotificationService,
      private modalController: ModalController,
      private popoverController: PopoverController,
      private postService: PostService,
      private pagesDataService: PagesDataService
  ) {}

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
    const data = JSON.parse(localStorage.getItem('n'));
    this.getNotificationsCount();
    this.getAllPosts();
  }
  getNotificationsCount() {
    const data = {user_id: this.userData.id};
    this.notificationService.getNotificationsCount(data, this.userData.jwt).subscribe(res => {
      this.unReadNotificationsCount = res;
    });
  }
  getAllPosts() {
    this.postService.getAllPost(this.userData.id, this.userData.jwt)
        .subscribe(posts => {
          if (this.refresherTarget) {
            this.refresherTarget.complete();
          }
          if (posts) {
            localStorage.setItem('post', JSON.stringify(posts));
            this.contents = posts;
            // this.postData = 'Post   ' + this.contents.length;
            for (const item of this.contents) {
              this.likes[item.post_id] = this.getFirst3Likers(item.likes);
              if (item.attachments != null) {
                this.postWithAttachment.push(item.post_id);
              }
              if (item.comments != null) {
                this.postWithComment.push(item.post_id);
              }
            }
          }
        });
  }
  getFirst3Likers(likes) {
    if (!likes) {
          return null;
      }
    const tmp = [];
    let count = 0;
    for (const item of likes) {
      if (item.user !== this.userData.id) {
        tmp.push(item);
        count++;
        if (count === 3) {
          break;
        }
      } else {
        // console.log('no like');
      }
    }
    return tmp;
  }
  likeModal(id) {
    const navigationExtras: NavigationExtras = {
      state: {
        postId: id
      }
    };
    this.postService.pushLikeModalId(id);
    localStorage.setItem('likeModalId', id);
    this.router.navigate(['/home/like'], navigationExtras);
  }
  reactModal(id) {
    const navigationExtras: NavigationExtras = {
      state: {
        postId: id
      }
    };
    this.router.navigate(['/home/comment'], navigationExtras);
  }
  checkAttachment(post) {
    if (this.postWithAttachment.indexOf(post) !== -1) {
      if (this.contents.post_id === post) {
        this.postArray = this.contents.attachments;
      }
      return true;
    } else {
      return false;
    }
  }
  likePost(id, ButtonId, index, postUserId) {
    document.getElementById(ButtonId).classList.toggle('likeActive');
    const tmp = this.contents[index].like_count;
    if (document.getElementById(ButtonId).classList.contains('likeActive')) {
      this.contents[index].like_count++;
    } else {
      this.contents[index].like_count--;
    }
    this.postService.adduserlike({user_id: this.userData.id, post_id: id, post_user_id: postUserId}, this.userData.jwt)
        .subscribe(res => {
          // console.log(res);
        }, error => {
              document.getElementById(ButtonId).classList.toggle('likeActive');
              this.contents[index].like_count = tmp;
            });
  }
  doRefresh(event) {
    this.refresherTarget = event.target;
    this.getNotificationsCount();
    this.postService.getAllPost(this.userData.id, this.userData.jwt)
        .subscribe(res => {
          if (res && res.data) {
            this.contents = res.data;
            localStorage.setItem('post', JSON.stringify(this.contents));
            // console.log(this.contents);
            // this.postData = 'Post   ' + this.contents.length;
            for (const item of this.contents) {
              if (item.likes) {
                this.likes[item.post_id] = this.getFirst3Likers(item.likes);
              } else {
                this.likes[item.post_id] = null;
              }
              if (item.attachments != null) {
                this.postWithAttachment.push(item.post_id);
              }
              if (item.comments != null) {
                this.postWithComment.push(item.post_id);
              }
            }
            // this.replacediv();
            return res.status;
          } else {
            return null;
          }
        });
  }
  openNotifications() {
    this.unReadNotificationsCount = 0;
    this.navController.navigateForward(['home/notifications']);
  }
  sharePost(id) {
    this.modalController.create({component: ShareComponent, componentProps: {shareId: id}})
        .then(modalEl => {
          modalEl.present();
        });
  }
  addPost() {
      this.modalController.create({component: NewPostComponent, componentProps: {}})
          .then(modalEl => {
              modalEl.present();
          });

  }
  postSettings(ev) {
    this.popoverController.create({
      component: PostSettingsComponent,
      event: ev,
      translucent: true
    }).then(el => {
      el.present();
    });
  }
  getClass(count, i) {
    i++;
    let options = '';
    if (count > 5 ) {
      count = 5;
      if (i > 5) {
        options = 'd-none';
      }
    }
    return 'p' + i + count + ' ' +  options;
  }
  viewAllImages(post) {
    this.pagesDataService.pushViewAllImagesData(post);
    this.router.navigate(['/home/viewAllImages']);
  }

  https(url: string) {
    if (url.indexOf('https') !== -1) {
      return url;
    } else {
      return url.replace('http', 'https');
    }
  }
  timeSince(time) {
    return  moment(time).fromNow();
  }

  async newpost() {
    // const modal = await this.modalcontroller.create({
    //   component: NewpostPage
    // });
    // modal.present();
  }
}
