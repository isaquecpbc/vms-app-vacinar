import { Inject, Injectable } from "@angular/core";
import { Preferences } from '@capacitor/preferences';
import Dexie, { Table } from "dexie";
import { StorageService } from "./storage.service";

export class Valores {
    // id!: string;
    key: string = '';
    value: string = '';
}

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    constructor(
        @Inject(StorageService) private storage: StorageService
    ) { }

    setItem(key: string, value: string) {
        this.storage.set(key, value);
    }

    getItem(keyItem: string) {
        return this.storage.get(keyItem);
    }

    clear(keyItem: string) {
        return this.storage.remove(keyItem);
    }
}