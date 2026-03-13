import { Injectable, Injector } from '@angular/core';
import { Lote } from '../models/lote.model';
import { SimpleBaseService } from './simple-base.service';

@Injectable({
  providedIn: 'root'
})
export class CampanhasLotesService extends SimpleBaseService<Lote> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, '/campanhas/{aditionalId}/lotes');
  }
}
