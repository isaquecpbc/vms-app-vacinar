import { Injectable } from "@angular/core";
import { Preferences } from '@capacitor/preferences';
import Dexie, { Table } from "dexie";

export class Valores {
    // id!: string;
    key: string = '';
    value: string = '';
}

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private db!: Dexie;
    private tableItems!: Table<Valores, any>;
    tableName = 'localStorage';

    constructor() {
        this.iniciarIndexedDb();
    }

    iniciarIndexedDb() {
        this.db = new Dexie('db-vms-app');
        this.db.version(1).stores({
            [this.tableName]: 'key'
        });
        this.tableItems = this.db.table(this.tableName);
    }

    async setItem(key: string, value: string) {
        await this.tableItems.delete(key);
        await this.tableItems.add({
            key,
            value
        });
    }

    async getItem(keyItem: string) {
        const result = await this.tableItems.where({'key': keyItem}).toArray();
        return result ? result[0].value : '';
    }

    async clear() {
        await this.tableItems.clear();
    }
}