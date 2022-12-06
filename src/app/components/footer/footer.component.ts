import { Component, OnInit } from '@angular/core';
import { ConnectionStatusService } from 'src/app/services/connection-status.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public isConnected = true;

  constructor(
    private statusConnection: ConnectionStatusService
  ) {
    this.ouvirStatusConexao();
  }

  ngOnInit() {}

  private ouvirStatusConexao() {
    this.statusConnection.statusConexao
      .subscribe(
        online => this.isConnected = online
      )
  }
}
