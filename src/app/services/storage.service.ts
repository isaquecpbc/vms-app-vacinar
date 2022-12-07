import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage-angular';

export class Valores {
    // id!: string;
    key: string = '';
    value: string = '';
}

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private _storage: Storage | null = null;

    constructor(private storage: Storage) {
        this.init();
    }

    async init() {
        const storage = await this.storage["create"]();
        this._storage = storage;
    }

    public set(key: string, value: any) {
        this._storage?.["set"](key, value);
    }

    public async get(key: string) {
        return await this._storage?.["get"](key);
    }

    public remove(key: string) {
        this._storage?.["remove"](key);
    }

    public clear() {
        this._storage?.["clear"]();
    }

    public getAll() {
        const lista: string[] = [];
        this._storage?.["forEach"]((key, value, index) => {
            lista.push(value);
        });
        return lista;
    }

}