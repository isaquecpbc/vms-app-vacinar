import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { Aplicacao } from '../models/aplicacao.model';
import { HttpResponse } from '@capacitor/core';
import { SimpleBaseService } from './simple-base.service';

@Injectable({
  providedIn: 'root'
})
export class AplicacoesService extends SimpleBaseService<Aplicacao> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, '/aplicacoes');
  }

}
