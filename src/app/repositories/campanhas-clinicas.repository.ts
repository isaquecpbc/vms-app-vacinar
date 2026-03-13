import { capSQLiteSet, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Clinica } from '../models/clinica.model';
import { SQLiteService } from '../services/sqlite.service';

@Injectable()
export class CampanhasClinicasRepository {
  constructor(private sqliteService: SQLiteService, private _databaseService: DatabaseService) {
  }

  async getAll(): Promise<Clinica[]> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      var products: DBSQLiteValues = await db.query("select * from clinica");
      return products.values as Clinica[];
    });
  }

  getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  async create(table: Clinica): Promise<Clinica> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "insert into clinica (id, razao) values (?, ?)";
      let values: Array<any> = [table.id, table.razao];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        return ret.changes as Clinica;
      }
      throw Error('create Aplicacao failed');
    });
  }

  async update(item: Clinica) {
    /*return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "update aplicacao set dtAplicacao = ? where id = ?";
      let values: Array<any> = [item.dtAplicacao, item.id];
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.changes > 0) {
        return await this.getById(item.id);
      }
      throw Error('update Clinica failed');
    });*/
  }

  async getById(id: number): Promise<Clinica> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "select * from aplicacao where id = ? limit 1";
      let values: Array<any> = [id];
      let ret: any = await db.query(sqlcmd, values);
      if (ret.values.length > 0) {
        return ret.values[0] as Clinica;
      }
      throw Error('get Clinica by id failed');
    });
  }

  async deleteById(id: string): Promise<void> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      await db.query(`delete from clinica where id = '${id}';`);
    });
  }

  async clear(): Promise<void> {
    await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      //delete all products
      let sqlcmd: string = "DELETE FROM clinica;";
      await db.execute(sqlcmd, false);
    });
  }

  async bulkInsert(values: Array<Clinica>) {
    this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "insert into clinica (id, razao) VALUES ";
      const aValues: Array<string> = [];
      values.map(i => aValues.push(`(${i.id}, "${i.razao}")`));
      await db.run(sqlcmd + aValues.join(','));
    });
  }

}
