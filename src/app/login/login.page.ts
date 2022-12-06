import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../models/auth.model';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formUser: string = '';
  formPassword: string = '';
  showLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private authIntegrationService: AuthIntegrationService
  ) { }

  ngOnInit() {
  }
//{"login":"aplica","password":"Vivotel@2022","system":"auth-vms","campanhaId":"165"}
  login(user: string, pass: string) {
    this.showLoading = true;
    const userObj = {
      id: user,
      login: user,
      password: pass,
      campanhaId: '165',
      system: 'auth-vms'
    } as Auth;
    this.authService
      .create(userObj).subscribe(
        item => {
          this.authIntegrationService.setToken(item.token || '');
          this.router.navigate(['/application-place']);
        },
        error => {
          this.presentToast('top', 'Ocorreu um erro ao realizar o login!');
          console.log(error);
        },
        () => this.showLoading = false
      );
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: position
    });

    this.showLoading = false
    await toast.present();
  }
}
