import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {FollowService} from '../../services/follow.service';

@Component({
  selector: 'app-follow-tabs',
  templateUrl: './follow-tabs.page.html',
  styleUrls: ['./follow-tabs.page.scss'],
})
export class FollowTabsPage implements OnInit {
  userData;
  constructor(
      private navController: NavController,
      private followService: FollowService
  ) { }

  ngOnInit() {
    this.userData = this.followService.getfollowData();
  }
  back() {
    this.followService.popfollowData();
    this.navController.back();
  }
}
