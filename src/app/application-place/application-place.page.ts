import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Clinica } from '../models/clinica.model';
import { ClinicasService } from '../services/clinicas.service';

@Component({
  selector: 'app-application-place',
  templateUrl: './application-place.page.html',
  styleUrls: ['./application-place.page.scss'],
})
export class ApplicationPlacePage implements OnInit {
  showLoading = false;
  clinicas: Array<Clinica> = [];
  formCep = '';

  constructor(
    private clinicasService: ClinicasService,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  filterApply(cep: string) {
    const filter = {cep};
    this.showLoading = true;

    this.clinicasService
      .get(null, {
        filters: filter,
        query: {per_page: '10'}
      }).subscribe(
        items => this.clinicas = items,
        error => console.log('ERROR:',error),
        () => this.showLoading = false
      );
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
