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
        await this.jessieStorage.getById(key)
            .then(() => this.jessieStorage.update({key, value}))
            .catch(() => this.jessieStorage.create({key, value}));
    }

    async getItem(keyItem: string) {
        const value = await this.jessieStorage.getById(keyItem);
        return value ? value.value : null;
    }

    clear() {
        return this.jessieStorage.clear();
    }
}
