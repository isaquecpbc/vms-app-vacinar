import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AplicacoesService } from '../services/aplicacoes.service';
import { CampanhasClinicasService } from '../services/campanhas-clinicas.service';

@Component({
  selector: 'app-network-sync',
  templateUrl: './network-sync.page.html',
  styleUrls: ['./network-sync.page.scss'],
})
export class NetworkSyncPage implements OnInit {
  applicationPlaceStatus = true;
  public totalImportadoAplicacao: number = 0;
  public totalRowsTableAplicacao: number = 1;
  public progressAplicacao:string = '0';
  public totalImportadoClinica: number = 0;
  public totalRowsTableClinica: number = 1;
  public progressClinica:string = '0';

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private aplicacaoService: AplicacoesService,
    private campanhasClinicasService: CampanhasClinicasService,
  ) { }

  ngOnInit() {
    this.campanhasClinicasService.totalRowsTable.subscribe(
      item => this.totalRowsTableClinica = item
    );
    this.aplicacaoService.totalRowsTable.subscribe(
      item => this.totalRowsTableAplicacao = item
    );
    this.campanhasClinicasService.totalImportaded.subscribe(
      item => {
        this.totalImportadoClinica += item;
        this.updateProgressClinica();
      }
    );
    this.aplicacaoService.totalImportaded.subscribe(
      item => {
        this.totalImportadoAplicacao += item;
        this.updateProgressAplicacao();
      }
    );

    this.showLoading();
  }

  updateProgressAplicacao() {
    this.progressAplicacao = this.totalRowsTableAplicacao ? parseFloat(`${this.totalImportadoAplicacao/this.totalRowsTableAplicacao}`).toFixed(2) : '0';
  }

  updateProgressClinica() {
    this.progressClinica = this.totalRowsTableClinica ? parseFloat(`${this.totalImportadoClinica/this.totalRowsTableClinica}`).toFixed(2) : '0';
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Dismissing after 3 seconds...',
      duration: 3000,
    });
/*
    this.aplicacaoService.salvarOffline({
      filters: {
        campanhaId: 127
      }
    });
    this.campanhasClinicasService.salvarOffline({aditionalId: 127});
*/
    loading.present();
  }

  next() {
    this.router.navigate(['/application-place']);
  }
}
