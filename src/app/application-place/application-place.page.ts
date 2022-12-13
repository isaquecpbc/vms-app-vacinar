import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Clinica } from '../models/clinica.model';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { ClinicasService } from '../services/clinicas.service';
import { AuthRepository } from '../repositories/auth.repository';

@Component({
  selector: 'app-application-place',
  templateUrl: './application-place.page.html',
  styleUrls: ['./application-place.page.scss'],
})
export class ApplicationPlacePage implements OnInit {
  showLoading = false;
  clinicas: Array<Clinica> = [];
  formCep = '';
  totalBco = 0;

  constructor(
    private clinicasService: ClinicasService,
    private router: Router,
    private toastController: ToastController,
    private authRepository: AuthRepository,
    private authIntegrationService: AuthIntegrationService
  ) { }

  async ngOnInit() {
    this.authIntegrationService.isAuthenticated();
    // await this.authRepository.createTestData();
    this.authRepository.getAll().then(
      (res) => { this.totalBco = res.length; console.log('TUDO', res)}
    )
  }

  filterApply(cep: string) {
    const filter = {cep};
    this.showLoading = true;

    this.clinicasService
      .getAll({
        filters: filter,
        query: {per_page: '10'}
      }).subscribe(
        items => {
          this.clinicas = items;
          if (!this.clinicas.length) {
            this.presentToast('top', 'Não foi encontrado nenhum local de Aplicação');
          }
        },
        error => console.log('ERROR:',error),
        () => this.showLoading = false
      );
  }

  voltar() {
    this.router.navigate(['/login']);
  }

  next(cep: string) {
    if (cep.length) {
      this.router.navigate(['/application']);
    }
    else {
      this.presentToast('top', 'É necessário selecionar um local de Aplicação');
    }
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
