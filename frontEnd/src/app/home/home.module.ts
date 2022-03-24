import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import {ProfilePage} from './profile/profile.page';
import {ViewReactionsComponent} from './view-reactions/view-reactions.component';
import {ViewLikesComponent} from './view-likes/view-likes.component';
import {MainPage} from './main/main.page';
import {NotificationsComponent} from './notifications/notifications.component';
import {ShareComponent} from './share/share.component';
import {Share} from '@capacitor/core';
import {NewPostComponent} from './new-post/new-post.component';
import {PostSettingsComponent} from './post-settings/post-settings.component';
import {FollowRequestComponent} from './follow-request/follow-request.component';
import {PostImagesComponent} from './post-images/post-images.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
        children: [
          {
            path: 'profile',
            loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
          },
          {
            path: 'follow',
            loadChildren: () => import('./follow-tabs/follow-tabs.module').then(m => m.FollowTabsPageModule)
          },
          {
            path: '',
            loadChildren: () => import('./main/main.module').then( m => m.MainPageModule)

          },
          {
            path: 'like',
            component: ViewLikesComponent
          },
          {
            path: 'comment',
            component: ViewReactionsComponent
          },
          {
            path: 'notifications',
            component: NotificationsComponent
          },
          {
            path: 'followrequest',
            component: FollowRequestComponent
          },
          {
            path: 'viewAllImages',
            component: PostImagesComponent
          },
        ]},
    ])
  ],
  declarations: [HomePage, ViewReactionsComponent, ViewLikesComponent, NotificationsComponent, ShareComponent, NewPostComponent,
                  PostSettingsComponent, FollowRequestComponent, PostImagesComponent],
  entryComponents: [ShareComponent, NewPostComponent, PostSettingsComponent]
})
export class HomePageModule {}
