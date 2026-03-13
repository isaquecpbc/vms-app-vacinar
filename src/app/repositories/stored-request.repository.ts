import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Aplicacao } from '../models/aplicacao.model';
import { StoredRequest } from '../models/stored-request.model';

@Injectable()
export class StoredRequestRepository {
  constructor(private _databaseService: DatabaseService) {
  }

  async getAll(): Promise<StoredRequest[]> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      var products: DBSQLiteValues = await db.query("select * from storedRequest");
      return products.values as StoredRequest[];
    });
  }

  async getAllUnComplete(): Promise<StoredRequest[]> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      var products: DBSQLiteValues = await db.query("select * from storedRequest where completed = 0");
      return products.values as StoredRequest[];
    });
  }

  getTimestamp() {
    return new Date().getTime();
  }

  getStringId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,5);
  }

  async create(table: StoredRequest): Promise<StoredRequest> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "INSERT or REPLACE into storedRequest (id,url,type,data,time,completed,response,header) values (?, ?, ?, ?, ?, ?, ?, ?)";
      let values: Array<any> = [table.id, table.url, table.type, table.data, this.getTimestamp(), table.completed, table.response, table.header];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        return ret.changes as StoredRequest;
      }
      throw Error('create Aplicacao failed');
    });
  }

  async update(item: StoredRequest) {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "update storedRequest set response = ?, completed = ? where id = ?";
      let values: Array<any> = [item.response, item.completed, item.id];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.changes > 0) {
        return await this.getById(item.id);
      }
      throw Error('update Aplicacao failed');
    });
  }

  async getById(id: string): Promise<StoredRequest> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "select * from storedRequest where id = ? limit 1";
      let values: Array<any> = [id];
      let ret: any = await db.query(sqlcmd, values);
      if (ret.values.length > 0) {
        return ret.values[0] as StoredRequest;
      }
      throw Error('get StoredRequest by id failed');
    });
  }

  async deleteById(id: string): Promise<void> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      await db.query(`delete from storedRequest where id = '${id}';`);
    });
  }

  async clear(): Promise<void> {
    await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      //delete all products
      let sqlcmd: string = "DELETE FROM storedRequest;";
      await db.execute(sqlcmd, false);
    });
  }

  async updateAllComplete(rows: Array<string>): Promise<void> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd = '';
      rows.map(row => sqlcmd += row);
      let ret: any = await db.run(sqlcmd);
      return await ret.changes.changes;
    });
  }
}
