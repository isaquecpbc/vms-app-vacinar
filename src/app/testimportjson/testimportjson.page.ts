import { Component, AfterViewInit } from '@angular/core';
import { dataToImport, partialImport1, partialImport2, partialImport3 } from '../utils/import-json-utils';
import { Dialog } from '@capacitor/dialog';
import { SQLiteService } from '../services/sqlite.service';
import { DetailService } from '../services/detail.service';

@Component({
  selector: 'app-testimportjson',
  templateUrl: 'testimportjson.page.html',
  styleUrls: ['testimportjson.page.scss']
})
export class TestimportjsonPage implements AfterViewInit {
  sqlite: any;
  platform!: string;
  handlerPermissions: any;
  initPlugin: boolean = false;
  showError = false;
  exportValues = '';

  constructor(private _sqlite: SQLiteService,
                    private _detailService: DetailService) {}

  async ngAfterViewInit() {
    const showAlert = async (message: string) => {
      await Dialog.alert({
      title: 'Error Dialog',
      message: message,
      });
    };
    try {
      await this.runTest();
      this.showError = false;
      console.log("$$$ runTest was successful");
    } catch (err) {
      this.showError = true;
      // await showAlert(err);
      console.log(`$$$ runTest failed ${err}`);
    }
  }


  async runTest(): Promise<void> {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      // ************************************************
      // Create Database from imported Json
      // ************************************************

      // test Json object validity
      result = await this._sqlite
                            .isJsonValid(JSON.stringify(dataToImport));
      if(!result.result) {
        return Promise.reject(new Error("IsJsonValid failed"));
      }
      // full import
      result = await this._sqlite
                           .importFromJson(JSON.stringify(dataToImport));
      if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'full' dataToImport failed"));


      // create the connection to the database
      let db = await this._sqlite
                        .createConnection("db-from-json", false,
                                          "no-encryption", 1);
      if(db === null) return Promise.reject(new Error("CreateConnection 'db-from-json' failed"));

      // open db "db-from-json"
      await db.open();

      // create synchronization table
      result = await db.createSyncTable();
      if (result.changes.changes < 0) return Promise.reject(new Error("CreateSyncTable failed"));


      result = await db.getSyncDate();
      if(result.length === 0) return Promise.reject(new Error("GetSyncDate failed"));

      // select all users in db
      result = await db.query("SELECT * FROM users;");
      console.log(`&&& Query4: ${result.values.length}`)
      console.log(`&&& Query4: ${JSON.stringify(result)}`)
      // if(result.values.length !== 4 ||
      //               result.values[0].name !== "Whiteley" ||
      //               result.values[1].name !== "Jones" ||
      //               result.values[2].name !== "Simpson" ||
      //               result.values[3].name !== "Brown"  ) {
      //   return Promise.reject(new Error("Query 4 Users failed"));
      // }

      // close the connection
      await this._sqlite.closeConnection("db-from-json");
      // partial import 1
      result = await this._sqlite
                        .importFromJson(JSON.stringify(partialImport1));
      if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial' partialImport1 failed"));
      console.log(`&&& Partial import 1 nb changes: ${result.changes.changes}`);
      // partial import 2
      result = await this._sqlite
                        .importFromJson(JSON.stringify(partialImport2));
      if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial' partialImport2 failed"));
      // partial import 3
      result = await this._sqlite
                        .importFromJson(JSON.stringify(partialImport3));
      if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial' partialImport2 failed"));
      // create the connection to the database
      db = await this._sqlite
                        .createConnection("db-from-json", false,
                                          "no-encryption", 1);
      if(db === null) return Promise.reject(new Error("CreateConnection 'db-from-json' after 'partial' failed"));

      // open db "db-from-json"
      await db.open();

      result = await db.getSyncDate();
      if(result.length === 0) return Promise.reject(new Error("GetSyncDate failed"));

      // select all users in db
      result = await db.query("SELECT * FROM users;");
      console.log('select all users in db',result);
      if(result.values.length !== 6 ||
                    result.values[0].name !== "Whiteley" ||
                    result.values[1].name !== "Jones" ||
                    result.values[2].name !== "Simpson" ||
                    result.values[3].name !== "Brown" ||
                    result.values[4].name !== "Addington" ||
                    result.values[5].name !== "Bannister" ) {
        return Promise.reject(new Error("Query 6 Users failed"));
      }
      // select all messages in db
      result = await db.query("SELECT * FROM messages;");
      console.log('select all messages in db',result);
      if(result.values.length !== 4||
                    result.values[0].title !== "test post 1" ||
                    result.values[1].title !== "test post 2" ||
                    result.values[2].title !== "test post 3" ||
                    result.values[3].title !== "test post 4" ) {
        return Promise.reject(new Error("Query 4 Messages failed"));
      }


      // select all images in db
      result = await db.query("SELECT * FROM images;");
      console.log('select all images in db', result);
      if(result.values.length !== 2 ||
                    result.values[0].name !== "feather" ||
                    result.values[1].name !== "meowth" ) {
        return Promise.reject(new Error("Query 2 Images failed"));
      }

      // close the connection
      await this._sqlite.closeConnection("db-from-json");

      this._detailService.setExportJson(true);

      return Promise.resolve();
    } catch (err) {
      if(await this._sqlite.isConnection("db-from-json")) {
        await this._sqlite.closeConnection("db-from-json");
      }
      this._detailService.setExportJson(false);
      return Promise.reject(err);
    }
  }

  private getRandomIntInclusive(min: number, max:number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  async createNew() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      // ************************************************
      // Create Database from imported Json
      // ************************************************

      // create the connection to the database
      let db = await this._sqlite
                        .createConnection("db-from-json", false,
                                          "no-encryption", 1);
      if(db === null) return Promise.reject(new Error("CreateConnection 'db-from-json' failed"));

      // open db "db-from-json"
      await db.open();

      const id = this.getRandomIntInclusive(1, 10000);
      let VALUES = `(${id},3,"meu teste","aqui é um teste")`;
      let sqlQuery = `INSERT INTO messages (id,userid,title,body) VALUES ${VALUES};`;
      result = await db.run(sqlQuery);

      if (result.changes.changes) {
        console.log('>>>>>>>>>>>>>>>>>>> create: ', JSON.stringify(result));
      }
      // // create synchronization table
      // result = await db.createSyncTable();
      // if (result.changes.changes < 0) return Promise.reject(new Error("CreateSyncTable failed"));

      // result = await db.getSyncDate();
      // if(result.length === 0) return Promise.reject(new Error("GetSyncDate failed"));

      // select all images in db
      result = await db.query("SELECT * FROM messages;");
      console.log('select all messages in db', result);

      // close the connection
      await this._sqlite.closeConnection("db-from-json");

      return Promise.resolve();
    }
    catch (err: any) {
      if(await this._sqlite.isConnection("db-from-json")) {
        await this._sqlite.closeConnection("db-from-json");
      }
      this._detailService.setExportJson(false);
      return Promise.reject(err);
    }
  }

  async updateRegistry() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      // create the connection to the database
      let db = await this._sqlite
                        .createConnection("db-from-json", false,
                                          "no-encryption", 1);
      if(db === null) return Promise.reject(new Error("CreateConnection 'db-from-json' failed"));

      // open db "db-from-json"
      await db.open();

      // select all images in db
      const last_modified = new Date().getTime();
      const sqlQuery = `UPDATE messages SET body='UPDATED', last_modified=${last_modified} where id=2;`;
      result = await db.run(sqlQuery);
      if (result.changes.changes) {
        console.log('>>>>>>>>>>>>>>>>>>> create: ', JSON.stringify(result));
      }

      // select all images in db
      result = await db.query("SELECT * FROM messages;");
      console.log('select all messages in db', result);

      // close the connection
      await this._sqlite.closeConnection("db-from-json");

      return Promise.resolve();
    }
    catch (err: any) {
      if(await this._sqlite.isConnection("db-from-json")) {
        await this._sqlite.closeConnection("db-from-json");
      }
      this._detailService.setExportJson(false);
      return Promise.reject(err);
    }
  }

  async exportRegistry() {
    try {
      let result: any = await this._sqlite.echo("Hello World");

      // create the connection to the database
      let db = await this._sqlite
                        .createConnection("db-from-json", false,
                                          "no-encryption", 1);
      if(db === null) return Promise.reject(new Error("CreateConnection 'db-from-json' failed"));

      // open db "db-from-json"
      await db.open();

      // select all images in db
      result = await db.query("SELECT * FROM messages;");
      console.log('select all images in db', result);

      await db.setSyncDate("2023-01-06T06:00:00.000Z");
      const jsonObj = await db.exportToJson('partial');
      this.exportValues = JSON.stringify(jsonObj, null, 4);
      console.log(jsonObj);
      // close the connection
      await this._sqlite.closeConnection("db-from-json");

      return Promise.resolve();
    }
    catch (err: any) {
      if(await this._sqlite.isConnection("db-from-json")) {
        await this._sqlite.closeConnection("db-from-json");
      }
      this._detailService.setExportJson(false);
      return Promise.reject(err);
    }
  }

}
