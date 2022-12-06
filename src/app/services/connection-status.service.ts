import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {

  private statusConexao$ = new Subject<boolean>();

  constructor() {
    window.addEventListener('online', () => this.atualizaConexao());
    window.addEventListener('offline', () => this.atualizaConexao());
  }

  get isOnline(): boolean {
    return window.navigator.onLine;
  }

  get statusConexao(): Observable<boolean> {
    return this.statusConexao$.asObservable();
  }

  atualizaConexao() {
    this.statusConexao$.next(this.isOnline);
  }
}
