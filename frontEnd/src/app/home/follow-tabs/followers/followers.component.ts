import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {FollowService} from '../../../services/follow.service';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss'],
})
export class FollowersComponent implements OnInit {
  userData;
  followers;
  imagePlaceholder = 'assets/image/aca.png';

  constructor(
      private followService: FollowService
  ) { }

  ngOnInit() {
    this.userData = this.followService.getfollowData();
    this.followers = this.userData.followers;
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
