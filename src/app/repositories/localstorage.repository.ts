
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

  async update(product: Product) {
    // return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
    //   let sqlcmd: string = "update products set name = ?, description = ?, price = ?, imageUrl = ?, isAvailable = ?, isPopular = ?, category = ? where id = ?";
    //   let values: Array<any> = [product.name, product.description, product.price, product.imageUrl, product.isAvailable, product.isPopular, product.category, product.id];
    //   let ret: any = await db.run(sqlcmd, values);
    //   if (ret.changes.changes > 0) {
    //     return await this.getById(product.id);
    //   }
    //   throw Error('update product failed');
    // });
  }

  async getById(key: string): Promise<LocalStorageValues> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "select * from localStorage where key = ? limit 1";
      let values: Array<any> = [key];
      let ret: any = await db.query(sqlcmd, values);
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
