import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from './footer/footer.component';
import { SuccessModalComponent } from './success-modal/success-modal.component';

@NgModule({
  declarations: [
    FooterComponent,
    SuccessModalComponent
  ],
  exports: [
    FooterComponent,
    SuccessModalComponent
  ],
  imports: [
    IonicModule.forRoot(),
    CommonModule
  ]
})
export class ComponentsModule { }
