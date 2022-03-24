import { Component } from '@angular/core';
import {ActivatedRoute, Router, RouterEvent} from '@angular/router';
import {AuthService} from '../services/auth.service';
import * as JWT from 'jwt-decode';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pages = [
    {
      title: 'Profile Page',
      url: '/home/profile'
    },
    {
      title: 'Messages Page',
      url: '/home/messages'
    },
    {
      title: 'Home Page',
      url: '/home'
    },
  ];
  selectedPath = '';
  constructor(private router: Router,
              private auth: AuthService) {}
  logout() {
    this.auth.logout();
  }

}
