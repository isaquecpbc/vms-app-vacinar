
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Product } from 'src/app/models/Product';
import { LocalStorageValues } from '../models/local-storage.model';

@Injectable()
export class LocalStorageRepository {
  constructor(private _databaseService: DatabaseService) {
  }

  async getAll(): Promise<LocalStorageValues[]> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      var products: DBSQLiteValues = await db.query("select * from localStorage");
      return products.values as LocalStorageValues[];
    });
  }

  getTimestampInSeconds () {
    return Math.floor(Date.now() / 1000);
  }

  async create(table: LocalStorageValues): Promise<LocalStorageValues> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "insert into localStorage (key, value) values (?, ?)";
      let values: Array<any> = [table.key, table.value];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        return ret.changes as LocalStorageValues;
      }
      throw Error('create LocalStorageValues failed');
    });
  }

  async update(item: LocalStorageValues) {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "update localStorage set value = ? where key = ?";
      let values: Array<any> = [item.value, item.key];
      let ret: any = await db.run(sqlcmd, values);
      console.log('update', ret);
      if (ret.changes.changes > 0) {
        return await this.getById(item.key);
      }
      throw Error('update LocalStorageValues failed');
    });
  }

  async getById(key: string): Promise<LocalStorageValues> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "select * from localStorage where key = ? limit 1";
      let values: Array<any> = [key];
      let ret: any = await db.query(sqlcmd, values);
      console.log('getById', ret);
      if (ret.values.length > 0) {
        return ret.values[0] as LocalStorageValues;
      }
      throw Error('get LocalStorageValues by id failed');
    });
  }

  async deleteById(id: string): Promise<void> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      await db.query(`delete from localStorage where key = '${id}';`);
    });
  }

  async clear(): Promise<void> {
    await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      //delete all products
      let sqlcmd: string = "DELETE FROM localStorage;";
      await db.execute(sqlcmd, false);
    });
  }
}
