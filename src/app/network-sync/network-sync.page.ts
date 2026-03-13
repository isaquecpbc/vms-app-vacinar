import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { CampanhasClinicasRepository } from '../repositories/campanhas-clinicas.repository';
import { AplicacoesService } from '../services/aplicacoes.service';
import { paramsRequest } from '../services/base.service';
import { CampanhasClinicasService } from '../services/campanhas-clinicas.service';
import { StoredRequestRepository } from '../repositories/stored-request.repository';
import { DetailService } from '../services/detail.service';
import { SQLiteService } from '../services/sqlite.service';
import { environment } from 'src/environments/environment';
import { BulkAplicacaoService } from '../services/bulk-aplicacao.service';
import { BulkAplicacao } from '../models/bulk-aplicacao.model';
import { forkJoin, ObservableInput } from 'rxjs';
import { Http, HttpOptions } from '@capacitor-community/http';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { EquipamentoMobileService } from '../services/equipamento-mobile.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipamentoMobile } from '../models/equipamento-mobile.model';

@Component({
  selector: 'app-network-sync',
  templateUrl: './network-sync.page.html',
  styleUrls: ['./network-sync.page.scss'],
})
export class NetworkSyncPage implements OnInit {
  applicationPlaceStatus = true;
  public totalImportadoAplicacao: number = 0;
  public totalRowsTableAplicacao: number = 1;
  public progressAplicacao: string = '0';
  public totalImportadoClinica: number = 0;
  public totalRowsTableClinica: number = 1;
  public progressClinica: string = '0';

  aClinicas: any;
  aStoreds: any;
  aWorkaround: any;
  public exConn!: boolean;

  verifyLocalDB = true;
  verifySendChanges = false;
  hasError = false;
  finishProcess = false;
  lastDtSync!: Date;
  log: string = '';
  loginUser: string = '';
  storagePatrimonio: string = '';
  resultAPISync: any = '';
  campanhaOffline = environment.CAMPANHA_OFFLINE;

  public networkStatus: any;

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private aplicacaoService: AplicacoesService,
    private campanhasClinicasService: CampanhasClinicasService,
    private campanhasClinicasRepository: CampanhasClinicasRepository,
    private storedRequestRepository: StoredRequestRepository,
    private _detailService: DetailService,
    private bulkAplicacaoService: BulkAplicacaoService,
    private mobileService: EquipamentoMobileService,
    private _sqlite: SQLiteService,
    private alertController: AlertController
  ) { }

  ionViewWillEnter() {
    this.exConn = this._detailService.getExistingConnection();
  }

  async ngOnInit() {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.networkStatus = status;
    });
    // this.showPrompt();
    this.networkStatus = await Network.getStatus();

    try {
      await this.checkDBExists();

      await this.getDateSync();
    }
    catch (err) {
      this.log += err + "\n";
      await this.fullImport();
    }

    try {
      if (this.networkStatus.connected) {
        await this.getAuthUser();
        await this.syncData();
        await this.setDateSync();
        await this.importData();
      }
      else {
        this.log += ' X X X SEM CONEXÃO COM A INTERNET X X X'
      }

      // Network.removeAllListeners();
    }
    catch (err) {
      this.log += err + "\n";
    }
    finally {
      this.finishProcess = true;
    }
  }

  async cadastroMobile(nroPatrimonio: string) {
    const info = await Device.getInfo();
    const infoId = await Device.getId();
    // info.realDiskFree // capacidadeArmazenamento
    // info.manufacturer // marca
    // info.name // modelo
    const params = {
      filters: {
        patrimonioNumero: nroPatrimonio
      },
    } as paramsRequest;
    this.mobileService.getAll(params).subscribe(
      (item) => {
        if (item.length && !item[0].uuid.length) {
          const obj = {
            uuid: infoId.uuid.replace(/[^0-9a-zA-Z]/g, '')
          } as EquipamentoMobile;
          this.mobileService.updateWorkaround(item[0].id, obj).subscribe(
            () => console.log('UUID Atualizado')
          );
        }
      },
      (error) => console.log('Error GetMobile')
    );
  }

  async checkDBExists() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.isDatabase(environment.DB_NAME);
      if (db1 == null || !db1.result) throw new Error(" X O Banco de Dados necessario nao foi encontrado");

      const db2 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db2 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db2.open();

      this.log += "  > O Banco de Dados existe no dispositivo atual\n";
      this.verifyLocalDB = true;
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  showPrompt() {
    this.alertController.create({
      backdropDismiss: false,
      header: 'Número do patrimonio',
      subHeader: 'Informe o número do patrimonio desse dispositivo',
      // message: 'Enter your favorate place',
      inputs: [
        {
          name: 'patrimonioNumero',
          placeholder: 'Número do patrimonio',

        },
      ],
      buttons: [
        // {
        //   text: 'Cancel',
        //   handler: (data: any) => {
        //     //console.log('Canceled', data);
        //     console.log('Canceled', this.printJSON(data))
        //   }
        // },
        {
          text: 'Confirmar',
          handler: (data: any) => {
            this.storagePatrimonio = data.patrimonioNumero;
            this.cadastroMobile(data.patrimonioNumero);
            this.storageNumeroPatrimonio(data.patrimonioNumero);
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }

  async getAuthUser() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      result = await db1.query("SELECT * FROM localStorage WHERE key='login_id' LIMIT 1");
      if (result.values.length) {
        this.loginUser = result.values[0].value;
      }

      result = await db1.query("SELECT * FROM localStorage WHERE key='numeroPatrimonio' LIMIT 1");
      console.log('Saved Information', this.printJSON(result.values));
      if (result.values.length && result.values[0].value.length) {
        this.storagePatrimonio = result.values[0].value;
      }
      else if (this.loginUser === 'admin') {
        this.showPrompt();
      }

      this.log += "  > O Banco de Dados existe no dispositivo atual\n";
      this.verifyLocalDB = true;
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  async storageNumeroPatrimonio(patrimonio: any) {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let sqlcmd: string = "INSERT or REPLACE into localStorage (key,value) values (?, ?)";
      let values: Array<any> = ['numeroPatrimonio', patrimonio];
      let ret: any = await db1.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        await this._sqlite.closeConnection(environment.DB_NAME);
        return Promise.resolve('ret.changes');
      }
      throw Error('Criação do LocasStorage: numeroPatrimonio');
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async importData() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const partialImport: any = {
        database: environment.DB_NAME,
        version: 1,
        encrypted: false,
        mode: "partial",
        tables: [
        ]
      };

      const options: HttpOptions = {
        url: environment.DB_URI_PARTIAL,
        params: {}
      };

      Http.get(options)
        .then(async (resp) => {
          partialImport.tables.push(resp.data);
          result = await this._sqlite.importFromJson(JSON.stringify(partialImport));
          this.log += " *** Obtendo novos registros do servidor\n";
          this.log += `  > Total de registros: ${result.changes.changes}\n`;
        });

      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async syncData() {
    try {
      let result: any = await this._sqlite.echo("Hello World");
      // this.verifySendChanges = true;
      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      let jsonObj: any = await db1.exportToJson('partial');
      // test Json object validity
      result = await this._sqlite.isJsonValid(JSON.stringify(jsonObj.export));
      if (!result.result) {
        return Promise.reject(new Error("IsJsonValid 'partial' export failed "));
      }

      if (jsonObj.export) {
        const aClinica: Array<any> = [];
        const lastSyncDate = new Date(await db1.getSyncDate()).getTime();
        for (const table of jsonObj.export.tables) {
          console.log(this.printJSON(jsonObj.export.tables));
          if (table.name === 'aplicacao') {
            const toSendValues = table.values.filter((item: any) => item[item.length - 1] > lastSyncDate);
            toSendValues.map((item: any) => {
              if (aClinica[item[7]] && aClinica[item[7]][item[2]]) {
                aClinica[item[7]][item[2]].push(`${item[4]}|${item[8]}`);
              }
              else {
                aClinica[item[7]] = { [item[2]]: [`${item[4]}|${item[8]}`] };
              }
            });
          }
        }

        let totalSync = 0
        const aRequests: Array<any> = [];
        aClinica.map((item, idx) => {
          const obj = {
            mobileNumeroPatrimonio: this.storagePatrimonio,
            campanhaId: this.campanhaOffline,
            usuarioNome: this.loginUser,
            // vacinaId: 57,
            clinicaId: idx,
            dtAplicacao: Object.keys(item)[0],
            codigoExternoParticipantes: Object.values(item).toString()
          } as BulkAplicacao;
          totalSync += item[Object.keys(item)[0]].length;
          aRequests.push(this.bulkAplicacaoService.createWorkaround(obj));
        });

        if (aRequests.length) {
          this.log += " *** Envio de dados local para o servidor\n";
          this.log += `  > Total enviado para o servidor: ${totalSync}\n`;
        }

        forkJoin(aRequests).subscribe(
          async item => {
            console.log('SUCESSO SEND API', JSON.stringify(item, null, 2));
            this.resultAPISync = item;
          },
          error => console.log('#2 Error:', error),
          () => this.verifySendChanges = true
        );
      }

      this._detailService.setExportJson(false);

      return Promise.resolve();
    }
    catch (err: any) {
      // Se nao houver nada para sincronizar retorna true
      if (`${err}`.match(/return Object is empty No data to synchronize/)) {
        this.verifySendChanges = true;
      }
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

  async getDateSync() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      result = await db1.getSyncDate();
      if (result.length === 0) return Promise.reject(new Error("GetSyncDate failed"));
      this.lastDtSync = new Date(result);

      // await this._sqlite.closeConnection(environment.DB_NAME);

      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  async setDateSync() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      const dtSync = new Date(await db1.getSyncDate()).getTime();
      const newDtSync: Date = new Date(dtSync);
      newDtSync.setDate(newDtSync.getDate() - 1); // subtracted 2 days from existing date

      let sqlcmd: string = "UPDATE aplicacao set last_modified = ? where last_modified > ?";
      let values: Array<any> = [newDtSync.getTime(), dtSync];
      let ret: any = await db1.run(sqlcmd, values);
      await db1.setSyncDate(new Date().toISOString());

      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  async fullImport() {
    const url1 = environment.DB_URI;
    this.log += "* Iniciando Download do Banco *\n";
    try {
      let result: any = await this._sqlite.echo("Hello World");

      await this._sqlite.getFromHTTPRequest(url1, true);
      this.log += "  > Obtendo banco completo do servidor\n";
      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      this.log += "  > Abertura do banco de dados ocorreu com sucesso\n";
      const retTables = await db1.getTableList();
      console.log(`>>> todasTabelas: ${JSON.stringify(retTables)}`);

      result = await db1.query("SELECT COUNT(*) as total FROM auth");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela1"));
      this.log += "  > total importado tabela1: " + result.values[0]['total'] + "\n";

      result = await db1.query("SELECT COUNT(*) as total FROM clinica");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela2"));
      this.log += "  > total importado tabela2: " + result.values[0]['total'] + "\n";

      result = await db1.query("SELECT COUNT(*) as total FROM aplicacao");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela3"));
      this.log += "  > total importado tabela3: " + result.values[0]['total'] + "\n";

      result = await db1.query("SELECT * FROM localStorage");
      if (result.length === 0) return Promise.reject(new Error(" X Falha ao exibir a tabela3"));
      this.log += "  > tabela tabela4: OK \n";

      // create synchronization table
      result = await db1.createSyncTable();
      if (result.changes.changes < 0) return Promise.reject(new Error("CreateSyncTable failed"));

      result = await db1.getSyncDate();
      if (result.length === 0) return Promise.reject(new Error("GetSyncDate failed"));
      this.lastDtSync = new Date(result);

      this.showPrompt();

      this.log += "  > Todas as consultas realizadas com sucesso\n";
      // await this._sqlite.closeConnection(environment.DB_NAME);
      this.log += "  > Fechamento do banco de dados ok\n";

      this.verifyLocalDB = true;

      return Promise.resolve();
    }
    catch (err) {
      this.hasError = false;
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  getAStoreds() {
    this.storedRequestRepository.getAll()
      .then(item => {
        console.log('stored-request', item);
        this.aStoreds = item;
      });
  }

  getAClinicas() {
    this.campanhasClinicasRepository.getAll()
      .then(item => {
        console.log('clinicas', item);
        this.aClinicas = item;
      });
  }

  updateProgressAplicacao() {
    this.progressAplicacao = this.totalRowsTableAplicacao ? parseFloat(`${this.totalImportadoAplicacao / this.totalRowsTableAplicacao}`).toFixed(2) : '0';
  }

  updateProgressClinica() {
    this.progressClinica = this.totalRowsTableClinica ? parseFloat(`${this.totalImportadoClinica / this.totalRowsTableClinica}`).toFixed(2) : '0';
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Dismissing after 3 seconds...',
      duration: 3000,
    });

    this.aplicacaoService.salvarOffline({
      filters: {
        campanhaId: this.campanhaOffline
      }
    });
    this.campanhasClinicasService.salvarOffline({ aditionalId: this.campanhaOffline });

    loading.present();
  }

  next() {
    this.router.navigate(['/application-place']);
  }

  getClinicasApi() {

    const params = {
      query: {
        returnType: 'includePagination',
        per_page: '1000'
      },
      filters: {
        campanhaId: this.campanhaOffline
      },
      aditionalId: this.campanhaOffline
    } as paramsRequest;
    this.campanhasClinicasService
      .getAll(params)
      .subscribe(
        itens => {
          this.totalRowsTableClinica = itens.length;
          itens.map(
            async (item, i) => await this.campanhasClinicasRepository.create(item)
              .then(() => {
                console.log(`CREATED NEW Clinica ${i}`);
                this.totalImportadoClinica++;
              })
          );
        }
      );
  }

  execGetWorkaround() {
    const params = {
      query: {
        returnType: 'includePagination',
        per_page: '1000'
      },
      filters: {
        campanhaId: this.campanhaOffline
      },
      aditionalId: this.campanhaOffline
    } as paramsRequest;
    this.campanhasClinicasService
      .getWorkaround(params)
      .then(
        results => {
          this.aWorkaround = results;
          console.log(results);
        }
      )
  }

  execSalvarOffline() {
    const params = {
      query: {
        returnType: 'includePagination',
        per_page: '1000'
      },
      filters: {
        campanhaId: this.campanhaOffline
      },
      aditionalId: this.campanhaOffline
    } as paramsRequest;
    this.campanhasClinicasService
      .saveOffLine(params)
      .then(
        results => {
          this.aWorkaround = results;
          console.log('saveOffLine', results);
        }
      )
  }
}
