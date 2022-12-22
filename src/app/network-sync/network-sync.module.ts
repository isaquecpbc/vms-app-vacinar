import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetworkSyncPageRoutingModule } from './network-sync-routing.module';

import { NetworkSyncPage } from './network-sync.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkSyncPageRoutingModule
  ],
  declarations: [NetworkSyncPage]
})
export class NetworkSyncPageModule {}
