import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthIntegrationService } from './services/auth-integration.service';
import { DatabaseService } from './services/database.service';
import { SQLiteService } from './services/sqlite.service';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Local de Aplicação', url: '/application-place', color: '', icon: 'business' },
    { title: 'Aplicar', url: '/application', color: '', icon: 'eyedrop' },
    // { title: 'Configurações', url: '/configuration', color: '', icon: 'construct' },
    //    { title: 'Sincronização', url: '/network-sync', color: '', icon: 'swap-vertical' },
    { title: 'Relatórios', url: '/reports', color: '', icon: 'document-text' },
    { title: 'Sair / Sincronizar', url: '/logout', color: 'danger', icon: 'log-out' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public isLogged = false;
  public initPlugin = false;
  private plataforma: string | undefined = 'web';

  constructor(
    private authService: AuthIntegrationService,
    private SQLiteService: SQLiteService
  ) {
    this.plataforma = this.SQLiteService.getPlatform();
    this.ouvirStatusLogin();
  }

  async ngOnInit() {
  }

  private ouvirStatusLogin() {
    this.authService.statusAuthentication
      .subscribe(
        online => this.isLogged = (online || this.plataforma !== 'web')
      )
  }
}
