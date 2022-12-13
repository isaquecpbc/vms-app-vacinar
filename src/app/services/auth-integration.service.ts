import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { Observable, Subject } from 'rxjs';
import { LocalStoragePreferencesService } from './localstorage-preferences.service';
import { LocalStorageService } from './localstorage.service';
import { LocalStorageJessieService } from './locastorage-jessie.service';
import { SQLiteService } from './sqlite.service';

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
  localStorage: LocalStoragePreferencesService|LocalStorageJessieService;
  private authenticationIsValid$ = new Subject<boolean>();

  constructor(
    private localStoragePreferences: LocalStoragePreferencesService,
    private localStorageJessie: LocalStorageJessieService,
    private SQLiteService: SQLiteService
  ) {
    const plataforma = this.SQLiteService.getPlatform();
    this.localStorage = plataforma === 'web' ? this.localStoragePreferences : this.localStorageJessie;
  }

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
