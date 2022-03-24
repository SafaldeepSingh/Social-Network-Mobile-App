import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import * as moment from 'moment';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  userData;
  commentCharLimit = '60';
  notifications;
  followRequest;
  followRequestCount;
  noData = false;
  imagePlaceholder = 'assets/image/aca.png';
  constructor(
      private notificationService: NotificationService,
      private navController: NavController
  ) {}

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
    this.getNotifications();
  }
  getNotifications() {
    const data = {user_id: this.userData.id};
    this.notificationService.getNotifications(data, this.userData.jwt).subscribe(res => {
      if (res.status) {
        this.notifications = res.data;
        this.followRequest = this.notifications.filter(e => (e.user !== this.userData.id && e.type === 'followRequest'));
        this.followRequestCount = this.followRequest.length;
        this.notificationService.setNotificationCount(this.followRequestCount);
        this.followRequest = this.followRequest.shift();
        this.notifications = this.notifications.filter(e => (e.user !== this.userData.id && e.type !== 'followRequest'));
      } else {
        this.noData = true;
      }
    });
  }
  shortComment(comment) {
    return comment.substring(0, this.commentCharLimit) + '...';
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
