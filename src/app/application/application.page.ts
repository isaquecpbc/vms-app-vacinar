import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal, ModalController, ToastController } from '@ionic/angular';
import { AplicacoesService } from '../services/aplicacoes.service';
import { Aplicacao } from '../models/aplicacao.model';
import { CripytexService } from '../services/cripytex.service';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { ProductRepository } from './repositories/product.repository';
import { Product } from '../models/Product';
import { SQLiteService } from '../services/sqlite.service';
import { environment } from 'src/environments/environment';
import { Clinica } from '../models/clinica.model';
import { OverlayEventDetail } from '@ionic/core/components';
import { Token } from '../models/token.model';
import { Lote } from '../models/lote.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocalStorageValues } from '../models/local-storage.model';
import { LocalStorageDBService } from '../services/localstorage-db.service';
import { Profissional } from '../models/profissional.model';
import { SuccessModalComponent } from '../components/success-modal/success-modal.component';

// import { Plugins } from '@capacitor/core';
// const { Device } = Plugins;
// import { Device } from '@capacitor/device';

@Component({
  selector: 'app-application',
  templateUrl: './application.page.html',
  styleUrls: ['./application.page.scss'],
})
export class ApplicationPage implements OnInit {
  public data = ['Amsterdam', 'Buenos Aires', 'Cairo', 'Geneva', 'Hong Kong', 'Istanbul', 'London', 'Madrid', 'New York', 'Panama City'];
  public results: Array<Aplicacao> = [];
  // public resultsAll: Array<Aplicacao> = [];
  handlerMessage = '';
  roleMessage = '';
  logMessage = '';
  showLoading = true;
  public products: Product[] = [];
  hasError = false;
  oClinica!: Clinica;
  unidade!: string;
  oLote!: Lote;
  oProfissional!: Profissional;
  public localStorageValues: Array<LocalStorageValues> = [];

  @ViewChild(IonModal) modal!: IonModal;
  isNumeric(val: string): boolean {
    return /^\d+$/.test(val);
  }

  /**
   * Formata o CPF com máscara 000.000.000-00
   */
  formatSearchCpf(event: any) {
    let value = event.target.value;

    // Remove tudo que não é número
    value = value.replace(/\D/g, '');

    // Aplica a máscara 000.000.000-00
    if (value.length > 9) {
      value = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6, 9) + '-' + value.substring(9, 11);
    } else if (value.length > 6) {
      value = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6, 9);
    } else if (value.length > 3) {
      value = value.substring(0, 3) + '.' + value.substring(3, 6);
    }

    // Atualiza o valor do campo
    this.form.controls['search'].setValue(value, { emitEvent: false });
  }

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name!: string;
  token!: Token;

  time1: any;
  time2: any;
  diff: any;

  form: FormGroup = this.formBuilder.group({
    search: [''],
  });

  constructor(
    private alertController: AlertController,
    private aplicacaoService: AplicacoesService,
    private cripytex: CripytexService,
    private toastController: ToastController,
    private authIntegrationService: AuthIntegrationService,
    private productRepository: ProductRepository,
    private formBuilder: FormBuilder,
    private _sqlite: SQLiteService,
    private cdref: ChangeDetectorRef,
    private localStorageDBService: LocalStorageDBService,
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    this.authIntegrationService.isAuthenticated();
    await this.localStorageDBService.getAllItens();

    this.unidade = JSON.parse(await this.getLocalStorageValue('unidade') || '');
    this.oClinica = JSON.parse(await this.getLocalStorageValue('clinica') || '') as Clinica;
    this.oLote = JSON.parse(await this.getLocalStorageValue('lote') || '') as Lote;
    this.oProfissional = JSON.parse(await this.getLocalStorageValue('profissional') || '') as Profissional;

    console.log('unidade', JSON.stringify(this.unidade));
    console.log('oClinica', JSON.stringify(this.oClinica));
    console.log('oLote', JSON.stringify(this.oLote));
    console.log('oProfissional', JSON.stringify(this.oProfissional));
    this.showLoading = false;
  }

  ngAfterViewInit() {
    this.results = [];
    this.cdref.detectChanges();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  async confirm() {
    await this.searchToken(this.name)
      .then(
        async (res) => {
          if (this.token.token && !this.token.vinculado) {
            await this.alertApplyPerToken(this.token.token);
            this.modal.dismiss(this.name, 'confirm');
          }
          else if (this.token.vinculado) {
            await this.alertTokenApply();
          }
          else {
            await this.alertTokenNotFound();
          }
        }
      )
      .catch(async () => {
        await this.alertTokenNotFound();
      });
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    this.name = '';
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  async searchParticipante(val: string) {
    this.showLoading = true;
    try {
      let result: any = await this._sqlite.echo("Hello World");

      // const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      // if (db1 == null) throw new Error(" X Falha ao criar a conexção com o banco");
      // await db1.open();

      let db1;
      // Essa porra só funcionou com essa opção
      let isConnection = await this._sqlite.checkConnectionsConsistency();
      if (isConnection.result) {
        db1 = await this._sqlite.retrieveConnection(environment.DB_NAME);
      }
      else {
        db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
        if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
        await db1.open();
      }

      let sqlPart = 'participanteNome LIKE ?';
      let values: Array<any> = [`${this.oClinica.id}`, `${this.oClinica.id}`];
      const re = new RegExp("^0+|[\.,; ]", "g");
      const copyVal = val.replace(re, '').replace(/\D/g, '');
      if (this.isNumeric(copyVal)) {
        sqlPart = '(CAST(participanteCodigoExterno AS TEXT) LIKE ?';
        sqlPart += ' OR CAST(participanteMatricula AS TEXT) LIKE ?)';
        values = [copyVal, copyVal, ...values];
      }
      else {
        values = [copyVal, ...values];
      }

      let sqlcmd: string = `select a.*, empresa.razao as conveniadaRazaoAplicada from aplicacao a INNER JOIN (   SELECT id, razao FROM clinica   UNION   SELECT id, razao FROM unidade ) as empresa ON empresa.id = a.conveniadaId WHERE ${sqlPart} AND (conveniadaId = ? OR conveniadaId IN (select id from unidade WHERE id_clinica = ?)) ORDER BY dtAplicacao, participanteNome LIMIT 10`;
      let resultQuery: any = await db1.query(sqlcmd, values);
      return Promise.resolve(resultQuery.values && resultQuery.values.length > 0 ? resultQuery.values : []);
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
      this.showLoading = false;
    }
  }

  async searchToken(val: string) {
    this.showLoading = true;
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar a conexção com o banco");
      await db1.open();

      let sqlcmd: string = "select * from token WHERE token = ? LIMIT 1";
      let values: Array<any> = [val];
      result = await db1.query(sqlcmd, values);
      this.token = {} as Token;
      if (result.values.length > 0) {
        this.token = result.values[0] as Token;
      }
      else {
        this.presentToast('top', 'Não foi possivel encontrar o protocólo informado!');
      }

      await this._sqlite.closeConnection(environment.DB_NAME);

      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      this.showLoading = false;
    }
  }

  printJSON(val: any) {
    try {
      return JSON.stringify(val, (key, value) => typeof value === 'symbol' ? String(value) : value, 2);
    } catch (error: any) {
      return `[Unable to stringify: ${error?.message || 'unknown error'}]`;
    }
  }

  async applyDB(id: number, participanteNome: string) {
    this.showLoading = true;
    const oDate = new Date();
    const last_modified = new Date().getTime();

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar a conexção com o banco");
      await db1.open();

      let sqlcmd: string = "UPDATE aplicacao set dtAplicacao = ?, conveniadaId = ?, profissionalId = ?, empresaId = ?, loteId = ?, last_modified = ? where id = ?";
      let values: Array<any> = [oDate.toISOString().split('T')[0], this.unidade, this.oProfissional.id, this.oClinica.id, this.oLote.id, last_modified, id];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.changes > 0) {
        // this.presentToast('bottom', 'A aplicação foi realizada com sucesso');
        // this.presentToast('bottom', `Aplicado! ${participanteNome}`);
        await this.presentSuccessModal(participanteNome);
        this.form.controls['search'].setValue('');
        this.results = [];

        await this._sqlite.closeConnection(environment.DB_NAME);
        return Promise.resolve(ret.changes);
      }

      throw Error('Atualização da aplicação');
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      this.showLoading = false;
    }
  }

  async vinculaToken(token: any) {
    this.showLoading = true;
    const oDate = new Date();
    const last_modified = new Date().getTime();

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar a conexção com o banco");
      await db1.open();

      let sqlcmd: string = "UPDATE token set vinculado = ? where token = ?";
      let values: Array<any> = [1, token];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.changes > 0) {
        await this._sqlite.closeConnection(environment.DB_NAME);
        return Promise.resolve(ret.changes);
      }

      throw Error('Não foi possivel criar vinculo do protocólo');
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      this.showLoading = false;
    }
  }

  async createAplicacaoDB(token: string) {
    this.showLoading = true;
    const oDate = new Date();
    const last_modified = new Date().getTime();
    // const str_last_modified = `${last_modified}`.substr(0, 10)

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar a conexção com o banco");
      await db1.open();

      let sqlcmd: string = "insert into aplicacao (participanteNome, participanteCodigoExterno, conveniadaId, loteId, dtAplicacao, last_modified, id) values (?, ?, ?, ?, ?, ?, ?)";
      let values: Array<any> = ['Aplicacao por protocolo', `PT-${token}`, this.unidade, this.oLote.id, oDate.toISOString().split('T')[0], last_modified, last_modified];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        await this.presentSuccessModal('Aplicação por protocolo', 'A aplicação foi realizada com sucesso');
        console.log('ENTROU AQUI-5');
        this.results = [];

        await this._sqlite.closeConnection(environment.DB_NAME);
        return Promise.resolve(ret.changes);
      }

      throw Error('Inclusao aplicacao por protocólo!');
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      this.showLoading = false;
    }
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
          handler: async () => {
            this.showLoading = true;
            await this.applyDB(id, participanteNome);
            this.handlerMessage = 'Alert confirmed';
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
  }

  async alertApplyPerToken(token: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar aplicação por protocólo!',
      subHeader: `Token '${token}' encontrado`,
      buttons: [
        {
          text: 'Aplicar',
          role: 'confirm',
          handler: async () => {
            await this.createAplicacaoDB(this.token.token);
            await this.vinculaToken(this.token.token);
            this.handlerMessage = 'Confirmado!';
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
  }

  async alertTokenNotFound() {
    const alert = await this.alertController.create({
      header: 'Protocólo NÃO encontrado!',
      subHeader: `O protocólo não foi encontrado, não foi possivel realizar a aplicação`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async () => {
            this.handlerMessage = 'Protocólo Not Found!';
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
  }

  async alertTokenApply() {
    const alert = await this.alertController.create({
      header: 'Protocólo já utilizado!',
      subHeader: `O protocólo informado já foi utilizado em outra aplicação`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async () => {
            this.handlerMessage = 'Protocólo Not Found!';
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

  async handleChange() {
    const query = this.form.controls['search'].value.toLowerCase();
    this.results = [];

    await this.searchParticipante(query)
      .then(result => {
        this.results = result;
        if (!result.length) {
          this.presentToast('top', 'Não foi encontrado nenhum participante');
        }
      })
  }

  formatCpf(value: string | number): string {
    let valorFormatado = value + '';

    valorFormatado = valorFormatado
      .padStart(11, '0')                  // item 1
      .substr(0, 11)                      // item 2
      .replace(/[^0-9]/, '')              // item 3
      .replace(                           // item 4
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );

    return valorFormatado;
  }

  async getLocalStorageValue(key: string) {
    if (!this.localStorageValues.length) {
      this.localStorageValues = await this.localStorageDBService.getAllItens();
    }
    const result = this.localStorageValues.filter((item: { key: any; }) => item.key === key);
    return result.length && result[0].value ? result[0].value : '';
  }

  async presentSuccessModal(participanteNome: string, mensagem?: string) {
    const modal = await this.modalController.create({
      component: SuccessModalComponent,
      componentProps: {
        participanteNome: participanteNome,
        mensagem: mensagem || `Aplicação registrada para ${participanteNome}`,
        lote: this.oLote.codigo,
        profissional: this.oProfissional.nome
      },
      cssClass: 'success-modal-class'
    });
    return await modal.present();
  }
}
