import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AplicacoesService } from '../services/aplicacoes.service';
import { Aplicacao } from '../models/aplicacao.model';
import { CripytexService } from '../services/cripytex.service';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { ProductRepository } from './repositories/product.repository';
import { Product } from '../models/Product';

@Component({
  selector: 'app-application',
  templateUrl: './application.page.html',
  styleUrls: ['./application.page.scss'],
})
export class ApplicationPage implements OnInit {
  public data = ['Amsterdam', 'Buenos Aires', 'Cairo', 'Geneva', 'Hong Kong', 'Istanbul', 'London', 'Madrid', 'New York', 'Panama City'];
  public results: Array<Aplicacao> = [];
  handlerMessage = '';
  roleMessage = '';
  showLoading = false;
  public products: Product[] = [];

  constructor(
    private alertController: AlertController,
    private aplicacaoService: AplicacoesService,
    private cripytex: CripytexService,
    private toastController: ToastController,
    private authIntegrationService: AuthIntegrationService,
    private productRepository: ProductRepository,
  ) {}

  ngOnInit() {
    this.authIntegrationService.isAuthenticated();
    this.getProducts();
  }

  async apply(id: number, participanteNome: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar aplicação!',
      subHeader: participanteNome,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.handlerMessage = 'Alert canceled';
          },
        },
        {
          text: 'Aplicar',
          role: 'confirm',
          handler: () => {
            this.showLoading = true;
            this.aplicacaoService
              .update(id, {dtAplicacao: '2020-01-18'} as Aplicacao).subscribe(
                item => {
                  this.results.forEach(el => {
                    if (el.id === id) {
                      el.dtAplicacao = 'now';
                    }
                  });
                  this.presentToast('top', `Aplicado! ${participanteNome}`);
                },
                error => console.log('ERROR:', error),
                () => this.showLoading = false
              );


            this.handlerMessage = 'Alert confirmed';
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: position
    });

    this.showLoading = false;
    await toast.present();
  }

  handleChange(event: any) {
    const query = event.target.value.toLowerCase();
    if (event.target.value.length > 3) {
      this.showLoading = true;
      this.aplicacaoService
        .getAll({
            filters: {
              participanteNomeCodigo: event.target.value,
              comAdesao: 'yes'
            },
            query: {per_page: '10'}
        }).subscribe(
          items => {
            this.results = items.map(
              aplicacao => {
                aplicacao.participanteNome = this.cripytex.decode(aplicacao.participanteNome);
                aplicacao.participanteCpf = this.cripytex.decode(aplicacao.participanteCpf);
                return aplicacao;
              }
            )
        },
        error => console.log('ERROR:',error),
        () => this.showLoading = false
      );
    }
    else {
      this.results = [];
    }
  }

  async getProducts() {
    // await this.productRepository.createTestData();
    this.products = await this.productRepository.getProducts();
    console.log(`databaseService used: products:`);
    console.log(this.products);

    //normal db open db close version
    // await this.productDefaultQueryRepository.getProducts();
    // console.log(`default dbopen dbclose used:`);
    // console.log(this.products);
  }

}
