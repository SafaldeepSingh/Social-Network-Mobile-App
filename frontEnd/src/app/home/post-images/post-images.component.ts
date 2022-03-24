import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {PostService} from '../../services/post.service';
import * as moment from 'moment';
import {ShareComponent} from '../share/share.component';
import {ModalController} from '@ionic/angular';
import {PagesDataService} from '../../services/pages-data.service';

@Component({
  selector: 'app-post-images',
  templateUrl: './post-images.component.html',
  styleUrls: ['./post-images.component.scss'],
})
export class PostImagesComponent implements OnInit, OnDestroy {
  post;
  userData;
  constructor(
      private router: Router,
      private postService: PostService,
      private modalController: ModalController,
      private pagesDataService: PagesDataService
  ) { }

  ngOnInit() {
      this.userData = JSON.parse(localStorage.getItem('n'));
      this.post = this.pagesDataService.getViewAllImagesData();
  }
  ngOnDestroy() {
      this.pagesDataService.popViewAllImagesData();
  }

    likePost(id, ButtonId, postUserId) {
        document.getElementById(ButtonId).classList.toggle('likeActive');
        const tmp = this.post.like_count;
        if (document.getElementById(ButtonId).classList.contains('likeActive')) {
            this.post.like_count++;
        } else {
            this.post.like_count--;
        }
        this.postService.adduserlike({user_id: this.userData.id, post_id: id, post_user_id: postUserId}, this.userData.jwt)
            .subscribe(res => {
                // console.log(res);
            }, error => {
                document.getElementById(ButtonId).classList.toggle('likeActive');
                this.post.like_count = tmp;
            });
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
  sharePost(id) {
        this.modalController.create({component: ShareComponent, componentProps: {shareId: id}})
            .then(modalEl => {
                modalEl.present();
            });
    }

  timeSince(time) {
    return  moment(time).fromNow();
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
  https(url: string) {
    if (url.indexOf('https') !== -1) {
      return url;
    } else {
      return url.replace('http', 'https');
    }
  }
}
