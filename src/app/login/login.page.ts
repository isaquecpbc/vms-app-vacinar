import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../models/auth.model';
import { AplicacoesService } from '../services/aplicacoes.service';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { AuthService } from '../services/auth.service';
import { LocalStoragePreferencesService } from '../services/localstorage-preferences.service';
import { LocalStorageNativeService } from '../services/locastorage-native.service';
import { StorageService } from '../services/storage.service';
// import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formUser: string = '';
  formPassword: string = '';
  showLoading = false;
  dbStatus: string|null = 'INICIANDO';
  dbStatusNative: string|null|void = 'INICIANDO';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private localStorage: LocalStoragePreferencesService,
    private aplicacaoService: AplicacoesService,
    private storageService: StorageService,
    private localStorageNative: LocalStorageNativeService,
    private authIntegrationService: AuthIntegrationService
  ) { }

  async ngOnInit() {
    this.storageService.set('teste', 'funciona porra storage');
    this.localStorageNative.setItem('brasil', 'Meia bomba');
    const token = await this.storageService.get('teste');
    const brasil = await this.localStorageNative.getItem('brasil');
    this.dbStatus = token;
    this.dbStatusNative = brasil;

    this.aplicacaoService
      .get(null, {
          filters: {
            comAdesao: 'yes'
          },
          query: {per_page: '10'}
      }).subscribe(
        items => {
          console.log(items);
      },
      error => console.log('ERROR:',error),
    );

    /*
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        this.dbStatus = 'CRIOU_DB';

        db.executeSql('create table danceMoves(name VARCHAR(32))', [])
          .then(() => {
            console.log('Executed SQL');
            this.dbStatus = 'CRIOU_TABLE';
          })
          .catch(e => {
            console.log(e);
            this.dbStatus = 'DEU_MERDA_TABLE';
          });


      })
      .catch(e => {
        console.log(e);
        this.dbStatus = 'DEU_MERDA_DB';
      });
      */
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
      .createWorkaround(userObj).subscribe(
        item => {
          console.log('item.token', JSON.stringify(item, null, 4));
          this.authIntegrationService.setToken(item.token || '');
          // TODO: Alterar para interceptor HTTP Request
          this.authIntegrationService.isAuthenticated();
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
