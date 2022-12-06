import { Inject, Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from "../../environments/environment";

enum TYPES {
    ENCRYPTED,
    DECRYPTED,
}

@Injectable({
    providedIn: 'root'
})
export class CripytexService {
    private appSignature: string;

    constructor() {
        this.appSignature = environment.KEY_ENCRYPT;
    }

    convert(type: TYPES, value: string, _key: string) {
        const CryptoJSAesJson = {
            stringify: function (cipherParams: any) {
                const vbJsonString = {
                    ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64),
                    iv: '',
                    s: ''
                };
                if (cipherParams.iv) {
                    vbJsonString['iv'] = cipherParams.iv.toString();
                }
                if (cipherParams.salt) {
                    vbJsonString['s'] = cipherParams.salt.toString();
                }
                return JSON.stringify(vbJsonString);
            },
            parse: function (jsonStr: any) {
                const vbJsonParse = JSON.parse(jsonStr);
                const cipherParams = CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Base64.parse(vbJsonParse.ct)
                });
                if (vbJsonParse.iv) {
                    cipherParams['iv'] = CryptoJS.enc.Hex.parse(vbJsonParse.iv);
                }
                if (vbJsonParse['s']) {
                    cipherParams.salt = CryptoJS.enc.Hex.parse(vbJsonParse.s);
                }
                return cipherParams;
            },
        };

        if (type === TYPES.ENCRYPTED) {
            return CryptoJS.AES.encrypt(
                JSON.stringify(value),
                _key,
                { format: CryptoJSAesJson }
            ).toString();
        }

        if (type === TYPES.DECRYPTED) {
            return JSON.parse(
                CryptoJS.AES.decrypt(
                    value,
                    _key,
                    { format: CryptoJSAesJson }
                ).toString(CryptoJS.enc.Utf8)
            );
        }

        return null;
    }

    //The set method is use for encrypt the value.
    encode(value: any, _clientKey = '') {
        return btoa(this.convert(TYPES.ENCRYPTED, value, `${this.appSignature}${_clientKey}`));
    }

    //The get method is use for decrypt the value.
    decode(value: any, _clientKey = '') {
        const value64 = atob(value);
        return this.convert(TYPES.DECRYPTED, value64, `${this.appSignature}${_clientKey}`);
    }
}