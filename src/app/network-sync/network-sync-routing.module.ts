import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetworkSyncPage } from './network-sync.page';

const routes: Routes = [
  {
    path: '',
    component: NetworkSyncPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetworkSyncPageRoutingModule {}
