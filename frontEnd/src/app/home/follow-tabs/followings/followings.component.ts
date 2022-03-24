import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {FollowService} from '../../../services/follow.service';

@Component({
  selector: 'app-followings',
  templateUrl: './followings.component.html',
  styleUrls: ['./followings.component.scss'],
})
export class FollowingsComponent implements OnInit {
  userData;
  followings;
  imagePlaceholder = 'assets/image/aca.png';
  constructor(
      private followService: FollowService
  ) { }

  ngOnInit() {
    this.userData = this.followService.getfollowData();
    this.followings = this.userData.followings;
  }
  getUserProfile(userId, profilePicture, name) {}
  followUser(followId, ButtonId) {
    const data = {
      user_id: this.userData.id,
      follow_id: followId
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
        });
  }
  profileImg(img) {
    if (!img) {
      return  this.imagePlaceholder;
    } else {
      return img ;
    }
  }
  timeSince(time) {
    return moment(time).fromNow();
  }

}
