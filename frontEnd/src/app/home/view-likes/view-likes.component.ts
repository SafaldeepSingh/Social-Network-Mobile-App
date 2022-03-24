import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import {PostService} from '../../services/post.service';
import {FollowService} from '../../services/follow.service';
import * as moment from 'moment';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-view-likes',
  templateUrl: './view-likes.component.html',
  styleUrls: ['./view-likes.component.scss'],
})
export class ViewLikesComponent implements OnInit {
  postId: any;

  userData: any;
  contents: any = null;
  noData = false;
  output: any;
  show: boolean;
  userdetailsarray: any;
  imageplaceholder = 'assets/image/aca.png';
  img: string;

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private navController: NavController,
      private modalctrl: ModalController,
      private postservice: PostService,
      private followservice: FollowService,
      private authService: AuthService
  ) {
    }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
    this.postId = this.postservice.getLikeModalId();
    this.getuserlikes();
  }
  getuserlikes() {
    const data = {
      post_id: this.postId,
      user_id: this.userData.id
    };
    this.postservice
        .getuserlike(data, this.userData.jwt)
        .subscribe((res: {data: any}) => {
              if (res.data === '0') {
                this.noData = true;
              } else {
                this.contents = res.data;
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
    this.followservice.followuser(data, this.userData.jwt).subscribe((res: {status: any} )  => {
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
  getUserProfile(userId, image, userName) {
    const userData = {
      id: userId, profileImage: image, name: userName,
    };
    const navigationExtras: NavigationExtras = {
      state: {
        data: userData
      }
    };
    this.authService.pushProfileData(userData);
    this.navController.navigateBack(['/home/profile'], navigationExtras);
  }
  timeSince(time) {
    return moment(time).fromNow();
  }
  back() {
    // console.log(this.postservice.popLikeModalId());
    this.postservice.popLikeModalId();
    this.navController.back();
  }

  folluserissame(followId) {
    if (this.userData.id === followId) {
      return false;
    } else {
      return true;
    }
  }

}

