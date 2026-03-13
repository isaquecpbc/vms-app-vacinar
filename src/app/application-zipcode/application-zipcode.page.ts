import { Component, OnInit } from '@angular/core';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Clinica } from '../models/clinica.model';
import { SQLiteService } from '../services/sqlite.service';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

class Port {
  public id!: number;
  public name!: string;
}

@Component({
  selector: 'app-application-zipcode',
  templateUrl: './application-zipcode.page.html',
  styleUrls: ['./application-zipcode.page.scss'],
})
export class ApplicationZipcodePage implements OnInit {
  showLoading = false;
  ports: Port[] = [];
  port: Port = new Port;
  hasError = false;

  unidades: Array<Clinica> = [];
  clinicas: Array<Clinica> = [];

  constructor(
    private _sqlite: SQLiteService,
    private toastController: ToastController,
  ) { 
    this.ports = [
      { id: 1, name: 'Tokai' },
      { id: 2, name: 'Vladivostok' },
      { id: 3, name: 'Navlakhi' }
    ];
  }

  async ngOnInit() {
    await this.searchAllUnidades();
  }
  
  portChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
  }


  async searchAllUnidades() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "select * from unidade";
      result = await db1.query(sqlcmd);
      if (result.values.length > 0) {
        this.unidades = result.values;
      }
      else {
        this.unidades = [];
        this.presentToast('top', 'Não foi encontrado nenhum local de Aplicação');
      }

      await this._sqlite.closeConnection(environment.DB_NAME);

      return Promise.resolve();
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
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
