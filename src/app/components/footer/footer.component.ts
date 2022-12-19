import { Component, OnInit } from '@angular/core';
import { AuthIntegrationService } from 'src/app/services/auth-integration.service';
import { ConnectionStatusService } from 'src/app/services/connection-status.service';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public isConnected = true;
  public isLogged = false;
  public networkStatus: any;

  constructor(
    private statusConnection: ConnectionStatusService,
    private authService: AuthIntegrationService
  ) {
    this.ouvirStatusConexao();
    this.ouvirStatusLogin();
  }

  async ngOnInit() {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.networkStatus = status;
    });

    this.networkStatus = await Network.getStatus();
  }

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
