import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FollowTabsPageRoutingModule } from './follow-tabs-routing.module';

import { FollowTabsPage } from './follow-tabs.page';
import {RouterModule} from '@angular/router';
import {HomePage} from '../home.page';
import {FollowersComponent} from './followers/followers.component';
import {FollowingsComponent} from './followings/followings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FollowTabsPageRoutingModule,
  ],
  declarations: [FollowTabsPage, FollowingsComponent, FollowersComponent]
})
export class FollowTabsPageModule {}
