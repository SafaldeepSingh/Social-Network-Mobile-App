import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AlertController, LoadingController} from '@ionic/angular';

import { Plugins } from '@capacitor/core';
import { FacebookLoginResponse } from '@rdlabo/capacitor-facebook-login';
import {log} from 'util';


const { FacebookLogin } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  LoginForm: FormGroup;
  loadingEl;
  constructor(public auth: AuthService,
              public router: Router,
              private fb: FormBuilder,
              private loadingCtrl: LoadingController,
              private alertController: AlertController
  ) {}

  ngOnInit() {
    this.LoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  async login() {
    const loadingEl = await this.loadingCtrl.create({keyboardClose: true, message: 'Logging In...'});
    await loadingEl.present();
    const data = {
      email: this.LoginForm.value.email,
      password: this.LoginForm.value.password
    };
    this.auth.login(data).subscribe(res => {
      if (res.status) {
        this.router.navigateByUrl('home');
        loadingEl.dismiss();
      } else {
        this.alertController.create({
          header: 'Alert',
          message: 'Something Went wrong!',
          // message: res,
          buttons: ['Ok']
        })
            .then(alertEl => {
              this.loadingEl.dismiss();
              alertEl.present();
            });
      }
    },
        error1 => {
          // console.log(error1);
          let msg = 'Something Went wrong!';
          if (error1.error === 'Wrong email or password.') {
            msg = 'Wrong Email or Password.';
          }
          this.alertController.create({
            header: 'Alert',
            // message: JSON.stringify(error1),
            message: msg,
            buttons: ['Ok']
          })
              .then(alertEl => {
                  this.loadingEl.dismiss();
                  alertEl.present();
              });
        });
  }
  toggle(pwd) {
    const x = (document.getElementById('password') as HTMLInputElement).type;
    if (x === 'password') {
      (document.getElementById('password') as HTMLInputElement).type = 'text';
      (document.getElementById('eye') as HTMLInputElement).src = 'assets/icon/eye-open.png';
    } else {
      (document.getElementById('password') as HTMLInputElement).type = 'password';
      (document.getElementById('eye') as HTMLInputElement).src = 'assets/icon/eye-close.png';
    }
  }
  async fbLogin() {
      this.loadingCtrl.create({keyboardClose: true, message: 'Logging In...'})
          .then(loadingEl => {
              this.loadingEl = loadingEl;
              loadingEl.present();
          });
      const FACEBOOK_PERMISSIONS = ['email', 'user_birthday', 'user_photos', 'user_gender'];
      const result  = await  <FacebookLoginResponse> FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS });
      if (result.accessToken) {
          // Login successful.
          console.log('Facebook token');
          console.log(JSON.stringify(result));
          fetch('https://graph.facebook.com/' +
              result.accessToken.userId + '?fields=id,email,first_name,last_name,gender,link,picture&type=large&access_token=' +
              result.accessToken.token).then(resData => {
              resData.json().then(userData => {
                  console.log('Facebook data');
                  console.log(JSON.stringify(userData));
                  const data = {first_name: userData.first_name, last_name: userData.last_name, email: userData.email,
                      profile_picture: userData.picture.data.url};
                  this.auth.thirdPartyLogin(data).subscribe(res => {
                      console.log('third party login');
                      console.log(JSON.stringify(res));
                      this.loadingEl.dismiss();
                      if (res.status) {
                          this.router.navigateByUrl('home');
                      } else {
                          this.alertController.create({
                              header: 'Alert',
                              message: 'Something Went wrong!',
                              // message: res,
                              buttons: ['Ok']
                          })
                              .then(alertEl => {
                                  // this.loadingEl.dismiss();
                                  alertEl.present();
                              });
                      }
                  }, error => {
                      this.loadingEl.dismiss();
                      console.log('third party login error');
                      console.log(JSON.stringify(error));
                  });
              });
          });
          // const userData = await response.json();
      } else {
          // Cancelled by user.
          this.loadingEl.dismiss();
      }
  }
  async googleLogin() {
      this.loadingCtrl.create({keyboardClose: true, message: 'Logging In...'})
          .then(loadingEl => {
              this.loadingEl = loadingEl;
              loadingEl.present();
          });
      try {
          const googleUser = await Plugins.GoogleAuth.signIn();
          console.log('google log in');
          console.log(JSON.stringify(googleUser));
          const data = {first_name: this.name(googleUser.displayName).firstName,
              last_name: this.name(googleUser.displayName).lastName, email: googleUser.email,
              profile_picture: googleUser.imageUrl};
          this.auth.thirdPartyLogin(data).subscribe(res => {
              console.log('third party Login');
              console.log(JSON.stringify(res));
              this.loadingEl.dismiss();
              if (res.status) {
                  this.router.navigateByUrl('home');
              } else {
                  this.alertController.create({
                      header: 'Alert',
                      message: 'Something Went wrong!',
                      // message: res,
                      buttons: ['Ok']
                  })
                      .then(alertEl => {
                          // this.loadingEl.dismiss();
                          alertEl.present();
                      });
              }
          }, error => {
              this.loadingEl.dismiss();
              console.log('third party login error');
              console.log(JSON.stringify(error));
          });
      } catch (e) {
          console.log('google login error');
          console.log(e);
          console.log(JSON.stringify(e));
      }
  }

  name(name: string) {
      const arrName = name.split(' ');
      let fName = '';
      let lName;
      arrName.forEach( function myfunc(item, index, array) {
          if (index === array.length - 1) {
              lName = item;
          } else {
              fName += ' ' +  item;
          }
      });
      return {firstName: fName, lastName: lName};
  }
}
