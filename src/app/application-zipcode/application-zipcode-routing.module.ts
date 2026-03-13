import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationZipcodePage } from './application-zipcode.page';

const routes: Routes = [
  {
    path: '',
    component: ApplicationZipcodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationZipcodePageRoutingModule {}
