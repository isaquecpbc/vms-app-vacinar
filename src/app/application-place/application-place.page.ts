import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Clinica } from '../models/clinica.model';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { ClinicasService } from '../services/clinicas.service';
import { AuthRepository } from '../repositories/auth.repository';
import { SQLiteService } from '../services/sqlite.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lote } from '../models/lote.model';
import { NetworkSyncService } from '../services/network-sync.service';
import { Profissional } from '../models/profissional.model';
import { SyncDataService } from '../services/sync-data.service';

@Component({
  selector: 'app-application-place',
  templateUrl: './application-place.page.html',
  styleUrls: ['./application-place.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ApplicationPlacePage implements OnInit {
  showLoading = false;
  clinicas: Array<Clinica> = [];
  unidades: Array<Clinica> = [];
  lotes: Array<Lote> = [];
  profissionais: Array<Profissional> = [];
  formCep = '';
  formIdClinica = '';
  totalBco = 0;
  hasConnection = false;
  hasError = false;
  logString: string = `Iniciando sincronização...\n\n`;
  limitDownloadPartials = 5000;

  form: FormGroup = this.formBuilder.group({
    cep: ['', Validators.required],
    profissionalId: ['', Validators.required],
    clinicaId: ['', Validators.required],
    loteId: ['', Validators.required],
    unidadeId: ['', Validators.required],
    unidade: [''],
  });

  handlerMessage = '';
  roleMessage = '';

  constructor(
    private clinicasService: ClinicasService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private networkSyncService: NetworkSyncService,
    private authRepository: AuthRepository,
    private authIntegrationService: AuthIntegrationService,
    private syncDataService: SyncDataService,
    private _sqlite: SQLiteService
  ) { }

  async ngOnInit() {
    await this.syncAplicacoes();
    await this.syncUnidades();
    await this.syncLotes();

    await this.searchAll();
    await this.searchAllLotes();
    await this.searchAllProfissionais();

    // this.authIntegrationService.isAuthenticated();
    // // await this.authRepository.createTestData();
    // this.authRepository.getAll().then(
    //   (res) => { this.totalBco = res.length; console.log('TUDO', res)}
    // )
  }

  async presentToast2(position: 'top' | 'middle' | 'bottom') {
    this.form.controls['cep'].value

    const toast = await this.toastController.create({
      message: 'Hello World!',
      duration: 3000,
      position: position,
      buttons: [
        {
          text: 'Confirmar',
          role: 'info',
          handler: () => {
            this.next();
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.handlerMessage = 'Dismiss clicked';
          },
        },
      ],
    });

    await toast.present();

    const { role } = await toast.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
  }

  async storedPlace() {
    const clinicas = this.clinicas.filter(item => item.id === parseInt(this.form.controls['clinicaId'].value));
    if (!clinicas.length) {
      this.presentToast('top', 'O Local de aplicação não foi encontrado');
      return Promise.reject();
    }

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "INSERT or REPLACE into localStorage (key, value) values (?, ?)";
      let values: Array<any> = ['clinica', JSON.stringify(clinicas[0])];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {

        await this._sqlite.closeConnection(environment.DB_NAME);

        return Promise.resolve(ret.changes);
      }
      throw Error('Criação do localStorage: Clinica');
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
  }

  async storedProfissional() {
    const profissionais = this.profissionais.filter(item => item.id === parseInt(this.form.controls['profissionalId'].value));
    if (!profissionais.length) {
      this.presentToast('top', 'O Enfermeiro(a) foi encontrado');
      return Promise.reject();
    }

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "INSERT or REPLACE into localStorage (key, value) values (?, ?)";
      let values: Array<any> = ['profissional', JSON.stringify(profissionais[0])];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {

        await this._sqlite.closeConnection(environment.DB_NAME);

        return Promise.resolve(ret.changes);
      }
      throw Error('Criação do localStorage: Profissional');
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
  }

  async storedUnidade() {
    await this.storeLocalStorage('unidade', this.form.controls['unidadeId'].value);
  }

  async storedLote() {
    const lotes = this.lotes.filter(item => item.id === parseInt(this.form.controls['loteId'].value));
    if (!lotes.length) {
      this.presentToast('top', 'O Local de aplicação não foi encontrado');
      return Promise.reject();
    }

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "INSERT or REPLACE into localStorage (key, value) values (?, ?)";
      let values: Array<any> = ['lote', JSON.stringify(lotes[0])];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {

        await this._sqlite.closeConnection(environment.DB_NAME);

        return Promise.resolve(ret.changes);
      }
      throw Error('Criação do localStorage: Lote');
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
  }

  async storeLocalStorage(key: string, value: number | string) {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "INSERT or REPLACE into localStorage (key, value) values (?, ?)";
      let values: Array<any> = [key, JSON.stringify(value)];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {

        await this._sqlite.closeConnection(environment.DB_NAME);

        return Promise.resolve(ret.changes);
      }
      throw Error(`Criação do localStorage: ${key} => ${value}`);
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
  }

  async filterApply(cep: string) {
    this.showLoading = true;
    try {
      let result: any = await this._sqlite.echo("Hello World");
      const cepLimpo = cep.replace(/\D/g, ''); // Remove formatação
      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();
      // TODO: Corrigir validação da clinica
      let sqlcmd: string = "select * from unidade where cep like ? and id_clinica = ? ORDER BY razao";
      // TODO: Corrigir validação da clinica
      let values: Array<any> = [cepLimpo, this.form.controls['clinicaId'].value];
      result = await db1.query(sqlcmd, values);
      if (result.values.length > 0) {
        this.unidades = result.values;
      }
      else {
        this.unidades = [];
        this.presentToast('top', 'Não foi encontrado nenhum local de Aplicação');
      }

      this.showLoading = false;
      await this._sqlite.closeConnection(environment.DB_NAME);

      return Promise.resolve();
    }
    catch (err) {
      this.hasError = false;
      this.showLoading = false;
      return Promise.reject(err);
    }
  }

  async searchAll() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "SELECT * FROM clinica ORDER BY razao";
      result = await db1.query(sqlcmd);
      if (result.values.length > 0) {
        this.clinicas = result.values;
      }
      else {
        this.clinicas = [];
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

  async searchAllLotes() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "select * from lote";
      result = await db1.query(sqlcmd);
      if (result.values.length > 0) {
        this.lotes = result.values;
      }
      else {
        this.lotes = [];
        this.presentToast('top', 'Não foi encontrado nenhum Lote');
      }

      await this._sqlite.closeConnection(environment.DB_NAME);

      return Promise.resolve();
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
  }

  async searchAllProfissionais() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "select * from profissional";
      result = await db1.query(sqlcmd);
      if (result.values.length > 0) {
        this.profissionais = result.values;
      }
      else {
        this.profissionais = [];
        this.presentToast('top', 'Não foi encontrado nenhum Profissional');
      }

      await this._sqlite.closeConnection(environment.DB_NAME);

      return Promise.resolve();
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
  }

  voltar() {
    this.router.navigate(['/login']);
  }

  async next() {
    await this.storedPlace();
    await this.storedProfissional();
    await this.storedLote();
    await this.storedUnidade();
    this.router.navigate(['/application']);
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

  selectUnidade() {
    this.form.controls['unidade'].reset();
    this.form.controls['unidadeId'].reset();
    this.filterApply(this.form.controls['cep'].value);
  }

  changeBanco() {
    this.form.controls['cep'].reset();
    this.form.controls['unidade'].reset();
    this.form.controls['unidadeId'].reset();
  }

  async syncFull() {
    await this.networkSyncService.syncDataFromDB()
      .then(async (resp) => {
        const message = "Sincronização FULL realizada com sucesso!";
        const position = 'bottom';
        const toast = await this.toastController.create({
          message,
          duration: 3000,
          position: position
        });

        await toast.present();

        console.log('RESP:', this.printJSON(resp));
        console.log('FINALIZADO => ' + (resp ? 'TRUE' : 'FALSE'));
      });
  }
  /**
   * Formata o CEP com máscara 00000-000
   */
  formatCep(event: any) {
    let value = event.target.value;

    // Remove tudo que não é número
    value = value.replace(/\D/g, '');

    // Aplica a máscara 00000-000
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }

    // Atualiza o valor do campo
    this.form.controls['cep'].setValue(value, { emitEvent: false });
  }

  printJSON(val: any) {
    try {
      return JSON.stringify(val, (key, value) => typeof value === 'symbol' ? String(value) : value, 2);
    } catch (error: any) {
      return `[Unable to stringify: ${error?.message || 'unknown error'}]`;
    }
  }

  async syncAplicacoes() {
    const result = await this.syncDataService.syncAplicacoes(this.limitDownloadPartials);
    this.hasConnection = result.hasConnection;
    if (result.total > 0) {
      this.logString += `Total aplicações inseridas => ${result.total}\n`;
    } else if (result.hasConnection) {
      this.logString += `Nenhuma aplicação nova encontrada\n`;
    } else {
      this.logString += `Sem conexão com a INTERNET\n`;
    }
  }

  async syncUnidades() {
    const result = await this.syncDataService.getNovasUnidades();
    this.hasConnection = result.hasConnection;
    if (result.total > 0) {
      this.logString += `Total unidades inseridas => ${result.total}\n`;
    } else if (result.hasConnection) {
      this.logString += `Nenhuma unidade nova encontrada\n`;
    } else {
      this.logString += `Sem conexão com a INTERNET\n`;
    }
  }

  async syncLotes() {
    const result = await this.syncDataService.getNovosLotes();
    this.hasConnection = result.hasConnection;
    if (result.total > 0) {
      this.logString += `Total lotes inseridos => ${result.total}\n`;
    } else if (result.hasConnection) {
      this.logString += `Nenhum lote novo encontrado\n`;
    } else {
      this.logString += `Sem conexão com a INTERNET\n`;
    }
  }
}
