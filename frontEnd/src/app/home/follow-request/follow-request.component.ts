import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import * as moment from 'moment';
import {AuthService} from '../../services/auth.service';
import {NotificationService} from '../../services/notification.service';
import {FollowService} from '../../services/follow.service';

@Component({
  selector: 'app-follow-request',
  templateUrl: './follow-request.component.html',
  styleUrls: ['./follow-request.component.scss'],
})
export class FollowRequestComponent implements OnInit {
  userData;
  followRequest;
  noData = false;
  loadingEl;
  showFollow = new Object();
  imagePlaceholder = 'assets/image/aca.png';
  constructor(
      private navController: NavController,
      private notificationService: NotificationService,
      private alertController: AlertController,
      private loadingController: LoadingController,
      private followService: FollowService
  ) {}

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
    this.getFollowRequest();
    this.notificationService.setNotificationCount(0);
  }
  getFollowRequest() {
    const data = {user_id: this.userData.id, request_seen: true };
    this.notificationService.getNotifications(data, this.userData.jwt).subscribe(res => {
      if (res.status) {
        this.followRequest = res.data;
        this.followRequest = this.followRequest.filter(e => (e.user !== this.userData.id && e.type === 'followRequest'));
        console.log(this.followRequest);
        if (this.followRequest.length === 0) { this.noData = true; }
      } else {
        this.noData = true;
      }
    });
  }
  confirm(id, index) {
    const data = {
      user_id: this.userData.id,
      follower_id: id
    };
    this.loadingController.create({message: 'Confirming Request...'})
        .then(el => {
          this.loadingEl = el;
          el.present();
        });
    this.notificationService.confirmFollowRequest(data, this.userData.jwt).subscribe(res => {
      if (res.status) {
        this.loadingEl.dismiss();
        this.showFollow[index] = true;
      } else {
        this.alertController.create({header: 'Alert' , message: 'Something Went wrong ! Please Try Again', buttons: ['OK']})
            .then(el => {
              el.present();
            });
      }
    },
    error1 => {});
  }
  delete(id, index) {
    const data = {
      user_id: this.userData.id,
      follower_id: id,
    };
    this.loadingController.create({message: 'Deleting Request...'})
        .then(el => {
          this.loadingEl = el;
          el.present();
        });
    this.notificationService.deleteFollowRequest(data, this.userData.jwt).subscribe(res => {
          if (res.status) {
            this.loadingEl.dismiss();
            this.followRequest.splice(index, 1);
            if (this.followRequest.length === 0) {
              this.noData = true;
            }
          } else {
            this.alertController.create({header: 'Alert' , message: 'Something Went wrong ! Please Try Again', buttons: ['OK']})
                .then(el => {
                  el.present();
                });
          }
        },
        error1 => {});
  }
  follow(id, ButtonId) {
    const data = {
      user_id: this.userData.id,
      follow_id: id
    };
    document.getElementById(ButtonId).classList.toggle('followActive');
    const oldVal = document.getElementById(ButtonId).innerText;
    if (oldVal === 'Follow') {
      document.getElementById(ButtonId).innerText = 'Following';
    } else {
      document.getElementById(ButtonId).innerText = 'Follow';
    }
    this.followService.followuser(data, this.userData.jwt).subscribe((res: {status: any} )  => {
          if (res.status) {} else {
            document.getElementById(ButtonId).classList.toggle('followActive');
            document.getElementById(ButtonId).innerText = oldVal;
          }
        },
        error => {
          document.getElementById(ButtonId).classList.toggle('followActive');
          if (oldVal === 'Follow') {
            document.getElementById(ButtonId).innerText = 'Following';
          } else {
            document.getElementById(ButtonId).innerText = 'Follow';
          }
          this.alertController.create({header: 'Alert', message: 'Something Went wrong ! Please Try Again'})
              .then(el => {
                el.present();
              });
        });
  }

  profileImg(img) {
    if (img === null ) {
      return  this.imagePlaceholder;
    } else {
      return img ;
    }
  }
  timeSince(time) {
    return moment(time).fromNow();
  }
  back() {
    this.navController.back();
  }
}
