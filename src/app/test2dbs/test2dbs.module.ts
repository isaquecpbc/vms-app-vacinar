import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Test2dbsPageRoutingModule } from './test2dbs-routing.module';

import { Test2dbsPage } from './test2dbs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Test2dbsPageRoutingModule
  ],
  declarations: [Test2dbsPage]
})
export class Test2dbsPageModule {}
