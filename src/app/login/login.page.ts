import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { from } from 'rxjs';
import { Auth } from '../models/auth.model';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { AuthService } from '../services/auth.service';
import { LocalStorageJessieService } from '../services/locastorage-jessie.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formUser: string = '';
  formPassword: string = '';
  showLoading = false;
  totalBco = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private authRepository: AuthRepository,
    private jessieService: LocalStorageJessieService,
    private authIntegrationService: AuthIntegrationService
  ) { }

  async ngOnInit() {
    await this.jessieService.setItem('token', '123 bolinha');

    const token = await this.jessieService.getItem('token');

    console.log ('token jessie', token);

    await this.authRepository.getAll().then(
      (res) => { this.totalBco = res.length; console.log('TUDO', res)}
    )
  }

  login(user: string, pass: string) {
    this.showLoading = true;
    const userObj = {
      id: user,
      login: user,
      password: pass,
      campanhaId: '165',
      system: 'auth-vms'
    } as Auth;
    this.authService.createWorkaround2(userObj)
      .subscribe(
        item => {
          console.log('item', item);
          //this.authRepository.create(item)
          //.then((result) => {
            //  console.log('passou aqui', result);
              this.authIntegrationService.setToken(item.token || '');
              // TODO: Alterar para interceptor HTTP Request
              this.authIntegrationService.isAuthenticated();
              this.router.navigate(['/application-place']);
            //}
          //);
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
