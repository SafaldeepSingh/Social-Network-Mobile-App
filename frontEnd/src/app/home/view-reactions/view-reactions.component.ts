import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController, NavController} from '@ionic/angular';
import {PostService} from '../../services/post.service';
import * as moment from 'moment';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-view-reactions',
  templateUrl: './view-reactions.component.html',
  styleUrls: ['./view-reactions.component.scss'],
})
export class ViewReactionsComponent implements OnInit {
  postId: any;

  newComment;
  noData = false;
  userData: any;
  replyData = null;
  comments: any = null;
  replies = new Object();
  imageplaceholder = 'assets/image/aca.png';
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private navController: NavController,
      private modalController: ModalController,
      private postService: PostService,
      private authService: AuthService,
      private alertController: AlertController
  ) {
      this.route.queryParams.subscribe(params => {
          if (this.router.getCurrentNavigation().extras.state) {
              this.postId = this.router.getCurrentNavigation().extras.state.postId;
          }
      });

  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
    this.getUserReactions();
  }
  getUserReactions() {
    const data = {
      post_id: this.postId,
      user_id: this.userData.id
    };
    this.postService
        .getusercomment(data, this.userData.jwt)
        .subscribe((res: {data: any}) => {
              if (res.data === '0') {
                  this.noData = true;
              } else {
                  this.comments = res.data.parent;
                  const replies = res.data.child;
                  if (replies !== undefined && replies) {
                      for (const item of replies) {
                          if (!(item.parent in this.replies)) {
                              this.replies[item.parent] = new Array();
                          }
                          this.replies[item.parent].push(item) ;
                      }
                  }
              }
            },
            error1 => console.log(error1));
  }
  profileimg(img) {
    if (img === null ) {
      return  this.imageplaceholder;
    } else {
      return img ;
    }
  }
  timeSince(time) {
    return moment(time).fromNow();
  }
  getUserProfile(userId, image, userName) {
    // console.log(id);
    // this.modalController.create({component: ProfileComponent, componentProps: {userId: id, profileImage: image, Name: name}})
    //     .then(modalEl => {
    //       modalEl.present();
    //     });
      const userData = {id: userId, profileImage: image, name: userName,};
      this.authService.pushProfileData(userData);
      this.navController.navigateBack(['/home/profile']);
  }
  addComment() {
      const parent = (this.replyData !== null ? this.replyData.parent : '0');
      const data = {user_id: this.userData.id, comment: this.newComment, parent_comment: parent, post_id: this.postId};
    // refresh and reset
      this.newComment = '';
      this.comments = null;
      this.replyData = null;
      this.replies =  new Object();
      this.postService.createComment(data, this.userData.jwt)
        .subscribe(res => {
            if (!res.status) {
                this.alertController.create({
                    header: 'Alert',
                    message: 'Something Went wrong!',
                    buttons: ['Ok']
                })
                    .then(alertEl => {
                        alertEl.present();
                    });
            }
            this.getUserReactions();
        });
  }
  setReplyData(Name, Parent) {
    this.replyData = {
      name: Name,
      parent: Parent
    };
  }
  back() {
        this.navController.back();
    }

  likeComment(commentId, buttonId) {
      document.getElementById(buttonId).classList.toggle('likeActive');
      const data = {
          comment: commentId,
          user: this.userData.id
      };
      this.postService.addCommentlike(data, this.userData.jwt)
          .subscribe(res => {
              console.log(res);
          },
              error1 => {
                  document.getElementById(buttonId).classList.toggle('likeActive');
              });
  }
}

