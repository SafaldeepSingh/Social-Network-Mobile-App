import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular';
import {PostService} from '../../services/post.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  userData;
  shareContent;
  shareId;
  constructor(
      private modalController: ModalController,
      private postService: PostService
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
  }
  sharePost() {
      const data = {
          id: this.userData.id,
          share_post_id: this.shareId,
          share_content: this.shareContent
      };
      this.postService.sharePost(data, this.userData.jwt).subscribe(res => {
          // console.log(res);
          this.postService.addNewPost(res.post);
      });
      this.close();
  }
  close() {
    this.modalController.dismiss();
  }
}
