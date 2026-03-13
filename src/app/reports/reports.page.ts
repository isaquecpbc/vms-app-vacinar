import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { SQLiteService } from '../services/sqlite.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportsPage implements OnInit {
  verifyLocalDB = false;
  log = '';
  oDateNow = '';
  totalToday!: any;
  totalToken!: any;
  totalClinicas!: any;
  totalAplicado = 0;
  totalFail = 0;
  totalNaoSincronizado = 0;

  form: FormGroup = this.formBuilder.group({
    dateFilter: [''],
  });
  oDates: Array<string> = [];

  constructor(
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private _sqlite: SQLiteService
  ) { }

  async ngOnInit() {
    this.oDateNow = (new Date).toISOString().split('T')[0];
    this.form.controls['dateFilter'].setValue(this.oDateNow);

    try {
      await this.checkDBExists();
      await this.getReports(this.oDateNow);
    }
    catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      alert(errorMessage);
    }
  }

  async changeDate() {
    await this.getReports(this.form.controls['dateFilter'].value);
    console.log('Alterou');
  }

  async checkDBExists() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.isDatabase(environment.DB_NAME);
      if (db1 == null || !db1.result) throw new Error(" X O Banco de Dados necessario nao foi encontrado");

      const db2 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db2 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db2.open();

      let sqlcmd: string = `SELECT dtAplicacao FROM aplicacao where dtAplicacao is not null group by dtAplicacao order by dtAplicacao desc`;
      result = await db2.query(sqlcmd);
      if (result.values) {
        this.oDates.push(this.oDateNow);
        result.values.map((item: { dtAplicacao: string; }) => {
          if (this.oDates.indexOf(item.dtAplicacao) === -1) {
            this.oDates.push(item.dtAplicacao)
          }
        });
      }
      // this.log += 'TOTAL HOJE\n';
      // this.log += JSON.stringify(result, null, 2);

      this.verifyLocalDB = true;
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }

  getDateBr() {
    return (new Date).toISOString().split('T')[0].split('-').reverse().join('/');
  }

  async getReports(strDate: string) {
    const url1 = environment.DB_URI;
    this.totalAplicado = 0;
    this.totalFail = 0;
    this.totalNaoSincronizado = 0;

    try {
      let result: any = await this._sqlite.echo("Hello World");

      const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
      if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
      await db1.open();

      // let sqlcmd: string = `SELECT dtAplicacao, count(*) as total FROM aplicacao where dtAplicacao = ? group by dtAplicacao`;
      let sqlcmd: string = `
        SELECT a.dtAplicacao, u.razao as unidade, u.cep, u.numero, c.razao as banco, count(*) as total 
        FROM aplicacao a 
        inner join unidade u on u.id=a.conveniadaId
        left join clinica c on c.id=u.id_clinica 
        where a.dtAplicacao = ?
        group by dtAplicacao, u.id, c.id`;
      let values: Array<any> = [strDate];
      result = await db1.query(sqlcmd, values);
      if (result.values) {
        this.totalToday = result.values;
        this.totalToday.map((item: { total: number; }) => this.totalAplicado += item.total);
      }
      this.log += 'TOTAL HOJE\n';
      this.log += JSON.stringify(result, null, 2);

      let sqlcmd1: string = `SELECT dtAplicacao, count(*) as total FROM aplicacao where participanteCodigoExterno LIKE 'PT-%' AND dtAplicacao = ? group by dtAplicacao`;
      let values1: Array<any> = [strDate];
      result = await db1.query(sqlcmd1, values1);
      if (result.values) {
        this.totalToken = result.values;
      }
      this.log += '\n\nTOTAL TOKEN\n';
      this.log += JSON.stringify(result, null, 2);

      let sqlcmd2: string = `
        SELECT a.dtAplicacao, c.id, c.razao, count(*) as total FROM aplicacao a
        INNER JOIN unidade u on u.id=a.conveniadaId
        INNER JOIN clinica c on c.id=u.id_clinica
        WHERE dtAplicacao = ?
        GROUP BY a.dtAplicacao,c.id;        
      `;
      let values2: Array<any> = [strDate];
      result = await db1.query(sqlcmd2, values2);
      if (result.values) {
        this.totalClinicas = result.values;
      }
      this.log += '\n\nTOTAL Clinica\n';
      this.log += JSON.stringify(result, null, 2);

      let sqlcmd3: string = `SELECT count(*) as total FROM aplicacao where dtAplicacao IS NOT NULL AND status = 2 group by status`;
      result = await db1.query(sqlcmd3);
      if (result.values && result.values.length) {
        this.totalFail = result.values[0].total;
      }
      this.log += '\n\nTOTAL FAILS\n';
      this.log += JSON.stringify(result, null, 2);

      let sqlcmd4: string = `SELECT count(*) as total FROM aplicacao where dtAplicacao IS NOT NULL AND status IS NULL GROUP BY status`;
      result = await db1.query(sqlcmd4);
      if (result.values && result.values.length) {
        this.totalNaoSincronizado = result.values[0].total;
      }
      this.log += '\n\nTOTAL NaoSincronizado\n';
      this.log += JSON.stringify(result, null, 2);

      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
    finally {
      await this._sqlite.closeConnection(environment.DB_NAME);
    }
  }
}
