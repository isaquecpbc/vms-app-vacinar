import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationPlacePage } from './application-place.page';

const routes: Routes = [
  {
    path: '',
    component: ApplicationPlacePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationPlacePageRoutingModule {}
