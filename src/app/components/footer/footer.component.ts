import { Component, OnInit } from '@angular/core';
import { AuthIntegrationService } from 'src/app/services/auth-integration.service';
import { ConnectionStatusService } from 'src/app/services/connection-status.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public isConnected = true;
  public isLogged = false;

  constructor(
    private statusConnection: ConnectionStatusService,
    private authService: AuthIntegrationService
  ) {
    this.ouvirStatusConexao();
    this.ouvirStatusLogin();
  }

  ngOnInit() {}

  private ouvirStatusConexao() {
    this.statusConnection.statusConexao
      .subscribe(
        online => this.isConnected = online
      )
  }

  private ouvirStatusLogin() {
    this.authService.statusAuthentication
      .subscribe(
        online => this.isLogged = online
      )
  }
}
