import { Injectable } from "@angular/core";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";
import { catchError, from } from "rxjs";
import { LocalStorageRepository } from "../repositories/localstorage.repository";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageJessieService {
    constructor(
        private jessieStorage: LocalStorageRepository
    ) {
    }

    async setItem(key: string, value: string) {
        return this.jessieStorage.deleteById(key)
            .then()
            .catch()
            .finally(() => this.jessieStorage.create({key, value}))
    }

    async getItem(keyItem: string) {
        await this.jessieStorage.getById(keyItem);
    }

    clear() {
        return this.jessieStorage.clear();
    }
}