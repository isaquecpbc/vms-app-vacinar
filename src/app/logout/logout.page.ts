import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { IonRouterOutlet } from '@ionic/core/components';
import { NetworkSyncService } from '../services/network-sync.service';
import { Observable, from, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {
  showLoading = true;
  hasError = false;

  constructor(
    private router: Router,
    private networkSyncService: NetworkSyncService,
    private platform: Platform,
    @Optional() private routerOutlet?: IonRouterOutlet
  ) { }

  async ngOnInit() {
    await this.networkSyncService.syncDataFromDB()
      .then((resp) => {
        console.log('FINALIZADO => ' + (resp ? 'TRUE' : 'FALSE'));
        if (resp !== false) {
          App.exitApp();
        }
        else {
          this.hasError = true;
        }
      });
  }

  close() {
    App.exitApp();
  }
}
