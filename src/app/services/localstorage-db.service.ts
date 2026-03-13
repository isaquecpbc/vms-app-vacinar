import { Inject, Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { StorageService } from "./storage.service";
import { SQLiteService } from "./sqlite.service";

export class Valores {
    // id!: string;
    key: string = '';
    value: string = '';
}

@Injectable({
    providedIn: 'root'
})
export class LocalStorageDBService {
    constructor(
        private _sqlite: SQLiteService,
    ) { }

    async setItem(key: string, value: string) {
        try {
            let result: any = await this._sqlite.echo("Hello World");

            const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
            if (db1 == null) throw new Error(` X Falha ao criar o banco de dados localmente - ${key}`);
            await db1.open();

            let sqlcmd: string = "INSERT or REPLACE into localStorage (key,value) values (?, ?)";
            let values: Array<any> = [key, value];
            let ret: any = await db1.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                await this._sqlite.closeConnection(environment.DB_NAME);
                return Promise.resolve('ret.changes');
            }
            throw Error(`Criação do LocasStorage: ${key}`);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    async getItem(key: string): Promise<string | null> {
        try {
            let db1;
            let isConnection = await this._sqlite.checkConnectionsConsistency();
            if (isConnection.result) {
                db1 = await this._sqlite.retrieveConnection(environment.DB_NAME);
            } else {
                db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
                if (db1 == null) throw new Error(` X Falha ao criar o banco de dados localmente - getItem(${key})`);
                await db1.open();
            }

            const result = await db1.query("SELECT value FROM localStorage WHERE key = ? LIMIT 1", [key]);
            await this._sqlite.closeConnection(environment.DB_NAME);

            if (result.values && result.values.length > 0) {
                return result.values[0]['value'] as string;
            }
            return null;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    async getAllItens() {
        try {
            let result: any = await this._sqlite.echo("Hello World");

            let db1;
            // Essa porra só funcionou com essa opção
            let isConnection = await this._sqlite.checkConnectionsConsistency();
            if (isConnection.result) {
                db1 = await this._sqlite.retrieveConnection(environment.DB_NAME);
            }
            else {
                db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
                if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
                await db1.open();
            }

            result = await db1.query("SELECT * FROM localStorage");

            return Promise.resolve(result.values);
        } catch (err) {
            return Promise.reject(err);
        }
        finally {
            await this._sqlite.closeConnection(environment.DB_NAME);
        }
    }
}