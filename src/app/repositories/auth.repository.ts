
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
// import productsData from './products-data-example';
import { DatabaseService } from 'src/app/services/database.service';
import { Product } from 'src/app/models/Product';
import { Auth } from '../models/auth.model';
@Injectable()
export class AuthRepository {
  constructor(private _databaseService: DatabaseService) {
  }

  async getAll(): Promise<Auth[]> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      var products: DBSQLiteValues = await db.query("select * from auth");
      return products.values as Auth[];
    });
  }

  getTimestampInSeconds () {
    return Math.floor(Date.now() / 1000)
  }

  async create(table: Auth): Promise<Auth> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "insert into auth (id, login, nome) values (?, ?, ?)";
      let values: Array<any> = [this.getTimestampInSeconds(), table.login, table.nome];
      console.log('(sqlcmd, values)', sqlcmd, values);
      let ret: any = await db.run(sqlcmd, values);
      if (ret.changes.lastId > 0) {
        console.log('ret.changes', ret);
        return ret.changes as Auth;
      }
      throw Error('create auth failed');
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

  async getById(login: string): Promise<Auth> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = "select * from auth where login = ? limit 1";
      let values: Array<any> = [login];
      let ret: any = await db.query(sqlcmd, values);
      console.log('ret', ret);
      if (ret.values.length > 0) {
        return ret.values[0] as Auth;
      }
      throw Error('get Auth by id failed');
    });
  }

  async deleteById(id: number): Promise<void> {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      await db.query(`delete from products where id = ${id};`);
    });
  }

  // async getProductsByCategory(category: string): Promise<Product[]> {
  //   return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
  //     let sqlcmd: string = "select * from products where category = ?";
  //     let values: Array<any> = [category];
  //     let ret: any = await db.query(sqlcmd, values);
  //     if (ret.values.length > 0) {
  //       return ret.values as Product[];
  //     }
  //     throw Error('get products by category failed');
  //   });
  // }

  async createTestData(): Promise<any> {
    // await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
    //   //delete all products
    //   let sqlcmd: string = "DELETE FROM products;";
    //   await db.execute(sqlcmd, false);
    // });

    // let products: Product[] = productsData;

    // for (let product of products) {
      // await this.createProduct(product);
    // }

    await this.create({login: 'admin', 'nome': 'admin'} as Auth);

  }
}
