import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { Aplicacao } from '../models/aplicacao.model';
import { HttpResponse } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AplicacoesService extends BaseService<Aplicacao> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, 'aplicacao', '/aplicacoes');
  }

  mapObjecttoOffiline(values: HttpResponse): Aplicacao[] {
    let result: Array<Aplicacao> = [];
    values.data.map((item: any) => result.push({
      id: item['id'],
      participanteNome: item['participanteNome'],
      dtAplicacao: item['dtAplicacao'],
    } as Aplicacao));

    return result;
  }
}
