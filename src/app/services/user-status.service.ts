import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthIntegrationService } from './auth-integration.service';

@Injectable({
  providedIn: 'root'
})
export class UserStatusService {

  private statusUser$ = new Subject<boolean>();

  constructor(
    private authIntegrationService: AuthIntegrationService
  ) {}

  get isOnline(): boolean {
    return this.authIntegrationService.isAuthenticated();
  }

  get statusUser(): Observable<boolean> {
    return this.statusUser$.asObservable();
  }

  atualizaStatus() {
    this.statusUser$.next(this.isOnline);
  }
}
