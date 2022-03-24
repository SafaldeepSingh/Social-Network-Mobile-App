import { Component, OnInit } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  PopoverController,
  ToastController
} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {PostService} from '../../services/post.service';
import * as moment from 'moment';
import {ViewLikesComponent} from '../view-likes/view-likes.component';
import {ViewReactionsComponent} from '../view-reactions/view-reactions.component';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {FollowService} from '../../services/follow.service';
import {ShareComponent} from '../share/share.component';
import {CameraResultType, CameraSource, Capacitor, Plugins} from '@capacitor/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {PagesDataService} from '../../services/pages-data.service';

@Component({
  selector: 'app-main',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  showLoading = true;
  userData: any;
  openUserData;
  contents: any;
  likes = new Object();
  postCount = '--';
  postArray = [];
  postData: any;
  output: any;
  pushpage: any;
  postWithAttachment = [];
  postWithComment = [];
  showdiv = true;
  parentId = 0;
  interval: any;
  respones: any;
  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private postService: PostService,
      private followService: FollowService,
      private auth: AuthService,
      private pagesDataService: PagesDataService,
      private modalController: ModalController,
      private navController: NavController,
      private loadingController: LoadingController,
      private toastController: ToastController,
      private alertController: AlertController,
      private http: HttpClient,
  ) {
    // this.route.queryParams.subscribe(params => {
    //   if (this.router.getCurrentNavigation().extras.state) {
    //     this.userData = this.router.getCurrentNavigation().extras.state.data;
    //   } else {
    //     this.userData = JSON.parse(localStorage.getItem('n'));
    //     this.userData.name = this.userData.first_name + ' ' + this.userData.last_name;
    //     this.userData.profileImage = this.userData.profile_picture;
    //   }
    // });
  }

  ngOnInit() {
    this.userData = this.auth.getProfileData();
    console.log(this.userData);
    if (!this.userData) {
          this.userData = JSON.parse(localStorage.getItem('n'));
          this.userData.name = this.userData.first_name + ' ' + this.userData.last_name;
          this.userData.profileImage = this.userData.profile_picture;
    }
    this.getpost();
  }
  getpost() {
        const data = JSON.parse(localStorage.getItem('n'));
        this.postService.getUserPost(data.id, this.userData.id, data.jwt)
            .subscribe(res => {
                this.showLoading = false;
                if (res !== null ) {
                    this.userData.followers = res.followers;
                    this.userData.followings = res.followings;
                    localStorage.setItem('usersPost', JSON.stringify(res.data));
                    this.postCount = '0';
                    if (res.data !== 'NO_POST_FOUND') {
                      this.contents = res.data;
                      this.postCount = this.contents.length;
                      this.postData = 'Post   ' + this.contents.length;
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
                    }
                    return res.status;
                } else {
                    return null;
                }
            });
    }
  getFirst3Likers(likes) {
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
        console.log('no like');
      }
      return tmp;
    }
  }
  likeModal(id) {
    console.log('id in likeModal' + id);
    const navigationExtras: NavigationExtras = {
      state: {
        postId: id
      }
    };
    this.postService.pushLikeModalId(id);
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
    const data = JSON.parse(localStorage.getItem('n'));
    this.postService.getUserPost(data.id, data.id, data.jwt)
        .subscribe(res => {
          this.showLoading = false;
          event.target.complete();
          if (res !== null ) {
            console.log(this.showLoading);
            this.userData.followers = res.followers;
            this.userData.followings = res.followings;
            localStorage.setItem('usersPost', JSON.stringify(res.data));
            this.postCount = '0';
            if (res.data !== 'NO_POST_FOUND') {
              this.contents = res.data;
              this.postCount = this.contents.length;
              this.postData = 'Post   ' + this.contents.length;
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
            }
            return res.status;
          } else {
            return null;
          }
        });
  }
  openFollowings() {
    this.followService.pushfollowData(this.userData);
    this.navController.navigateBack(['/home/follow/followings']);
  }
  openFollowers() {
    this.followService.pushfollowData(this.userData);
    this.navController.navigateBack(['/home/follow/followers']);
  }
  sharePost(id) {
    this.modalController.create({component: ShareComponent, componentProps: {shareId: id}})
        .then(modalEl => {
          modalEl.present();
        });
  }
  async changeProfilePhoto() {
    // let profileImage;
    // for debugging
    // const profileImage = 'https://lh3.googleusercontent.com/-exjT2HQeA1A/AAAAAAAAAAI' +
    //     '/AAAAAAAAAAA/ACHi3rc1GYtslTd6heuj-WwwBU4Rx1byoQ.CMID/s192-c/photo.jpg';
    if (!Capacitor.isPluginAvailable('Camera')) {
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 500,
      width: 500,
      resultType: CameraResultType.Uri
    }).then(async  image => {
      const profileImage = image.webPath;
      const loading = await this.loadingController.create({
        message: 'Uploading...'
      });
      await loading.present();
      const formData = new FormData();
      const blob = await fetch(profileImage).then(r => r.blob());
      formData.append('profile_pic', blob, `postAttachment.jpg`);
      formData.append('user_id', this.userData.id);
      this.auth.changeProfileImage(formData, this.userData.jwt).subscribe(res => {
        loading.dismiss();
        const tmp = JSON.parse(localStorage.getItem('n'));
        tmp.profile_picture = res.data;
        this.userData.profile_picture = res.data;
        localStorage.setItem('n', JSON.stringify(tmp));
        this.toastController.create({
          message: 'Profile Photo Changed Successfully',
          duration: 2000,
          buttons: [
            {
              text: 'Done',
              role: 'cancel'
            }
          ]
        }).then(toastEl => {
          toastEl.present();
        });
      }, error1 => {
        loading.dismiss();
        this.alertController.create({header: 'Alert', message: `Something Went wrong! Please try again`, buttons: ['OK']})
            .then(alertEl => {
              alertEl.present();
            });
      });
    }).catch(error => {});

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
  timeSince(time) {
    return moment(time).fromNow();
  }
  https(url: string) {
    if (url.indexOf('https') !== -1) {
      return url;
    } else {
      return url.replace('http', 'https');
    }
  }
  back() {
    this.navController.back();
  }
}
