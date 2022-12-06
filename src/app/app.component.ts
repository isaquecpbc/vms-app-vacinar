import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { AuthIntegrationService } from './services/auth-integration.service';
import { ConnectionStatusService } from './services/connection-status.service';
import { UserStatusService } from './services/user-status.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewChecked {
  public appPages = [
    { title: 'Local de Aplicação', url: '/application-place', icon: 'business' },
    { title: 'Aplicar', url: '/application', icon: 'eyedrop' },
    { title: 'Configurações', url: '/configuration', icon: 'construct' },
    { title: 'Relatórios', url: '/folder/Inbox', icon: 'document-text' },
    { title: 'Sair', url: '/login', icon: 'log-out' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public isLogged = false;

  constructor(
    private authService: AuthIntegrationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewChecked() {
    this.isLogged = this.authService.isAuthenticated();
    this.cdr.detectChanges();
  }
}
