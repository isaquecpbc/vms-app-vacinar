
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Aplicacao } from '../models/aplicacao.model';

@Injectable()
export class AplicacoesRepository {
  constructor(private _databaseService: DatabaseService) {
  }

  async getAll(): Promise<Aplicacao[]> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      var products: DBSQLiteValues = await db.query("select * from aplicacao");
      return products.values as Aplicacao[];
    });
  }

  getTimestampInSeconds () {
    return Math.floor(Date.now() / 1000);
  }

  async create(table: Aplicacao): Promise<Aplicacao> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "insert into aplicacao (id, participanteNome, dtAplicacao, updatedAt) values (?, ?, ?, ?)";
      let values: Array<any> = [table.id, table.participanteNome, table.dtAplicacao];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        return ret.changes as Aplicacao;
      }
      throw Error('create Aplicacao failed');
    });
  }

  async update(item: Aplicacao) {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "update aplicacao set dtAplicacao = ? where id = ?";
      let values: Array<any> = [item.dtAplicacao, item.id];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.changes > 0) {
        return await this.getById(item.id);
      }
      throw Error('update Aplicacao failed');
    });
  }

  async getById(id: number): Promise<Aplicacao> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "select * from aplicacao where id = ? limit 1";
      let values: Array<any> = [id];
      let ret: any = await db.query(sqlcmd, values);
      console.log('getById', ret);
      if (ret.values.length > 0) {
        return ret.values[0] as Aplicacao;
      }
      throw Error('get Aplicacao by id failed');
    });
  }

  async deleteById(id: string): Promise<void> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      await db.query(`delete from aplicacao where id = '${id}';`);
    });
  }

  async clear(): Promise<void> {
    await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      //delete all products
      let sqlcmd: string = "DELETE FROM aplicacao;";
      await db.execute(sqlcmd, false);
    });
  }
}
