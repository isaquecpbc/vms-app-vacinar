import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthIntegrationService } from './services/auth-integration.service';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
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
    private databaseService: DatabaseService,
  ) {
    this.ouvirStatusLogin();
  }

  ngOnInit() {

  }
  async initializeApp() {
      this.databaseService.init();
      this.databaseService.dbReady.subscribe(isReady => {
        if (isReady) {
          console.log('DATABASE_CREATED!');
          // loading.dismiss();
          // this.statusBar.styleDefault();
          // this.splashScreen.hide();
        }
      });
  }

  private ouvirStatusLogin() {
    this.authService.statusAuthentication
      .subscribe(
        online => this.isLogged = online
      )
  }
}
