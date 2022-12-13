import { Injectable } from "@angular/core";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageNativeService {
    constructor(
        private nativeStorage: NativeStorage
    ) {
    }

    async setItem(key: string, value: string) {
        await this.nativeStorage.setItem(key, value);
    }

    async getItem(keyItem: string) {
        await this.nativeStorage.getItem(keyItem);
    }

    clear(keyItem: string) {
        // return this.storage.remove(keyItem);
    }
}
