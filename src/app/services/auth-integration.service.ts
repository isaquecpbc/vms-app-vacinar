import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { Observable, Subject } from 'rxjs';
import { LocalStoragePreferencesService } from './localstorage-preferences.service';
import { LocalStorageService } from './localstorage.service';

export enum TYPE {
  ERROR='error',
  SUCCESS='success',
  WARNING='warning',
  INFO='info',
  QUESTION='question'
}

@Injectable({
  providedIn: 'root'
})
export class AuthIntegrationService {
  constructor(
    private localStorage: LocalStoragePreferencesService
  ) {}
  private authenticationIsValid$ = new Subject<boolean>();

  logout() {
    // this.localStorage.clear();
  }

  setToken(token: string) {
    this.localStorage.setItem('token', token);
  }

  async isAuthenticated() {
    const status = this.tokenIsValid();
    this.authenticationIsValid$.next(await status);

    return status;
  }

  async getToken() {
    const token = await this.localStorage.getItem('token');
    return token !== null ? `${token}` : '';
  }

  async tokenIsValid() {
    let result = false;
    try {
      const token = this.getDecodedAccessToken(await this.getToken());
      const date = new Date(token.exp * 1000);
      result = new Date < date;
    }
    catch(Error) { }

    return result;
  }

  private getDecodedAccessToken(token: string): any {
    let result = null;
    try {
        result = jwt_decode(token);
    }
    catch(Error) { }

    return result;
  }

  get statusAuthentication(): Observable<boolean> {
    return this.authenticationIsValid$.asObservable();
  }
}
