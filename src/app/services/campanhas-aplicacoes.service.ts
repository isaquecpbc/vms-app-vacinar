import { Injectable, Injector } from '@angular/core';
import { Aplicacao } from '../models/aplicacao.model';
import { SimpleBaseService } from './simple-base.service';

@Injectable({
  providedIn: 'root'
})
export class CampanhasAplicacoesService extends SimpleBaseService<Aplicacao> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, '/campanhas/{aditionalId}/aplicacoes');
  }
}
