import { Injectable, Injector } from '@angular/core';
import { SimpleBaseService } from './simple-base.service';
import { EquipamentoMobile } from '../models/equipamento-mobile.model';

@Injectable({
  providedIn: 'root'
})
export class EquipamentoMobileService extends SimpleBaseService<EquipamentoMobile> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, '/equipamento-mobile');
  }

}
