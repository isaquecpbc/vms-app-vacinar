import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationPlacePageRoutingModule } from './application-place-routing.module';

import { ApplicationPlacePage } from './application-place.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ApplicationPlacePageRoutingModule
  ],
  declarations: [ApplicationPlacePage]
})
export class ApplicationPlacePageModule {}
