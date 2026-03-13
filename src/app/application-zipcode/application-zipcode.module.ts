import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationZipcodePageRoutingModule } from './application-zipcode-routing.module';

import { ApplicationZipcodePage } from './application-zipcode.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicSelectableModule,
    ApplicationZipcodePageRoutingModule
  ],
  declarations: [ApplicationZipcodePage]
})
export class ApplicationZipcodePageModule {}
