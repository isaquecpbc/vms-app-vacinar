import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetworkSyncPageRoutingModule } from './network-sync-routing.module';

import { NetworkSyncPage } from './network-sync.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    NetworkSyncPageRoutingModule
  ],
  declarations: [NetworkSyncPage]
})
export class NetworkSyncPageModule {}
