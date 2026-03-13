import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthIntegrationService } from '../services/auth-integration.service';
import { LoadingController } from '@ionic/angular';
import { SQLiteService } from '../services/sqlite.service';
import { environment } from 'src/environments/environment';
import { LocalStorageDBService } from '../services/localstorage-db.service';
import { CripytexService } from '../services/cripytex.service';
import { NetworkSyncService } from '../services/network-sync.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formUser: string = '';
  formPassword: string = '';
  numeroPatrimonio = '';
  lastLogin = '';
  showLoading = false;
  localStorageValues: Array<any> = [];
  envFRONT = environment;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authIntegrationService: AuthIntegrationService,
    private loadingCtrl: LoadingController,
    private _sqlite: SQLiteService,
    private localStorageDBService: LocalStorageDBService,
    private cripytex: CripytexService,
    private networkSyncService: NetworkSyncService,
  ) { }

  async ngOnInit() {
    this.showLoading = true;
    await this.simpleLoader('Verificando conexão com a internet!');
    try {
      await this.checkDBExists();
      this.showLoading = false;
    }
    catch (err) {
      this.logString += err + "\n";
      await this.fullImport();
      this.showLoading = false;
    }

    try {
      await this.simpleLoader('Verificando se existem novas aplicações!');
      await this.getPatrimonioLocal();
      await this.getLastLogin();

      this.hideLoader();
      console.log('Delay Inicio');
      setInterval(async () => {
        await this.networkSyncService.syncDataFromDB()
          .then(async (resp) => {
            console.log('resp', JSON.stringify(resp));
            const message = "Sincronização automática";
            const position = 'bottom';
            const toast = await this.toastController.create({
              message,
              duration: 3000,
              position: position
            });

            await toast.present();
            console.log("Sincronização automática: " + new Date());
          });
      }, 10 * (60 * 1000)); // 10 minutos
    }
    catch (err) {
      this.hideLoader();
      this.logString += '\nErro recuperação banco: ' + err + "\n";
    }
  }

  logString: string = 'Inicio!';

  async simpleLoader(message: string) {
    await this.loadingCtrl.create({
      message: message,
    }).then((response) => {
      response.present();
    });
  }

  async hideLoader() {
    await this.loadingCtrl.dismiss().then((response) => {
      console.log('Loader closed!', response);
    }).catch((err) => {
      console.log('Error occured : ', err);
    });
  }

  async checkDBExists() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.isDatabase(environment.DB_NAME);
      if (db1 == null || !db1.result) throw new Error(" X O Banco de Dados necessario nao foi encontrado");

      const db2 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db2 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db2.open();

      this.hideLoader();
      console.log('Aqui 04');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  printJSON(val: any) {
    try {
      return JSON.stringify(val, (key, value) => typeof value === 'symbol' ? String(value) : value, 2);
    } catch (error: any) {
      return `[Unable to stringify: ${error?.message || 'unknown error'}]`;
    }
  }

  async fullImport() {
    const url1 = environment.DB_URI;

    this.logString += "\n* Iniciando Download do Banco *\n";
    try {
      let result: any = await this._sqlite.echo("Hello World");

      await this._sqlite.copyFromAssets(true);
      this.logString += "  > Obtendo banco local (assets)\n";
      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      this.logString += "  > Abertura do banco de dados (Assets) ocorreu com sucesso\n";
      const retTables = await db1.getTableList();
      console.log(`>>>todasTabelas: ${JSON.stringify(retTables)}`);

      result = await db1.query("SELECT COUNT(*) as total FROM auth");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela1"));
      this.logString += "  > total importado tabela1: " + result.values[0]['total'] + "\n";

      result = await db1.query("SELECT COUNT(*) as total FROM clinica");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela2"));
      this.logString += "  > total importado tabela2: " + result.values[0]['total'] + "\n";

      result = await db1.query("SELECT COUNT(*) as total FROM aplicacao");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela3"));
      this.logString += "  > total importado tabela3: " + result.values[0]['total'] + "\n";

      result = await db1.query("SELECT * FROM localStorage");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela4"));
      this.logString += "  > tabela localStorage: OK \n";

      result = await db1.createSyncTable();
      if (result.changes.changes < 0) return Promise.reject(new Error("CreateSyncTable failed"));

      result = await db1.getSyncDate();
      if (result.length === 0) return Promise.reject(new Error("GetSyncDate failed"));

      this.logString += "  > Todas as consultas realizadas com sucesso\n";
      this.logString += "  > Fechamento do banco de dados ok\n";

      this.hideLoader();
      return Promise.resolve();
    }
    catch (err) {
      this.hideLoader();
      return Promise.reject(err);
    }
    finally {
      this.hideLoader();
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  async login(user: string, pass: string) {
    const resultado = await this.authIntegrationService.login(user, pass);
    if (!resultado) {
      this.presentToast('top', 'Usuário e/ou senha inválidos!');
      return;
    }
    await this.localStorageDBService.setItem('login_id', resultado.login);
    await this.localStorageDBService.setItem('login_token', resultado.token);
    await this.localStorageDBService.setItem('lastLogin', new Date().toISOString()).then(() => console.log('StorageLastLogin OK'));
    const authValue = { ...resultado, nome: resultado.login, password: pass };
    console.log('AUTH VALUE', JSON.stringify(authValue));
    await this.storageAuth(authValue);
    this.router.navigate(['/application-place']);
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

  async storageAuth(auth: any) {
    let db1: any;
    try {
      let result: any = await this._sqlite.echo("Hello World");

      let isConnection = await this._sqlite.checkConnectionsConsistency();
      if (isConnection.result) {
        db1 = await this._sqlite.retrieveConnection(environment.DB_NAME);
      }
      else {
        db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
        if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
        await db1.open();
      }

      let sqlcmd: string = "INSERT or REPLACE into auth (login,nome,token,password) values (?, ?, ?, ?)";
      let values: Array<any> = [auth.login, auth.nome, auth.token, this.cripytex.encode(auth.password)];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        console.log(`REPLACE LOGIN ${auth.password}`);
        await this._sqlite.closeConnection(environment.DB_NAME);
        return Promise.resolve('ret.changes');
      }
      throw Error('Criação do usuario: StorageAuth');
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async getPatrimonioLocal() {
    console.log('Chamando - getPatrimonioLocal');
    if (!this.localStorageValues.length) {
      this.localStorageValues = await this.localStorageDBService.getAllItens();
    }
    const key = 'numeroPatrimonio';
    const result = this.localStorageValues.filter((item: { key: any; }) => item.key === key);
    this.numeroPatrimonio = result.length ? `${JSON.parse(result[0].value)}` : '';
  }

  async getLastLogin() {
    console.log('Chamando - getLastLogin');
    if (!this.localStorageValues.length) {
      this.localStorageValues = await this.localStorageDBService.getAllItens();
    }
    const key = 'lastLogin';
    const result = this.localStorageValues.filter((item: { key: any; }) => item.key === key);
    this.lastLogin = result.length && result[0].value ? result[0].value : '';
  }
}
