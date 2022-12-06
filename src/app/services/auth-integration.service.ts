import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

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
  constructor() {}

  logout() {
    localStorage.clear();
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  isAuthenticated() {
    return this.tokenIsValid();
  }

  private getToken() {
    return localStorage.getItem('token') || '';
  }

  private tokenIsValid() {
    let result = false;
    try {
      const token = this.getDecodedAccessToken(this.getToken());
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
}
