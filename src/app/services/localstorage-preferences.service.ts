import { Injectable } from "@angular/core";
import { Preferences, SetOptions } from '@capacitor/preferences';

@Injectable({
    providedIn: 'root'
})
export class LocalStoragePreferencesService {
    async setItem(key:string, value: string) {
        await Preferences.remove({key});
        await Preferences.set({
            key,
            value,
          });
    }

    async getItem(keiItem: string) {
        const { value } = await Preferences.get({ key: keiItem });
        return value;
    }

    async clear() {
        return await Preferences.clear();
    }
}