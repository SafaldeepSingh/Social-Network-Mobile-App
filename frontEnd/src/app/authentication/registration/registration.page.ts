import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../model/user.model';
import {AuthService} from '../../services/auth.service';
import {ModalController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  RegisterForm: FormGroup;
  user: User;
  phone: '7837169844';
  constructor(public auth: AuthService,
              public toast: ToastController ,
              public fb: FormBuilder,
              public modalcontroller: ModalController
  ) {}

  ngOnInit() {
    this.RegisterForm = this.fb.group({
          first_name:  ['', Validators.required],
          last_name:  ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          password: ['', Validators.required],
        }
    );
  }
  register() {
    console.log('function reg called');
    const data = {
      first_name: this.RegisterForm.value.first_name,
      last_name: this.RegisterForm.value.last_name,
      email: this.RegisterForm.value.email,
      password: this.RegisterForm.value.password,
      phone: this.phone
    };
    this.auth.register(data).subscribe(res => {
      if (res.status) {
        console.log('you are registered ');
      }
    });
  }
  async phonever() {
    // const modal = await this.modalcontroller.create({
    //   component: PhoneverPage
    // });
    // modal.present();
  }

}
