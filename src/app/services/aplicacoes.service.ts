import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { Aplicacao } from '../models/aplicacao.model';
import { HttpResponse } from '@capacitor/core';
import { AplicacoesRepository } from '../repositories/aplicacoes.repository';

@Injectable({
  providedIn: 'root'
})
export class AplicacoesService extends BaseService<Aplicacao> {

  constructor(
    protected override injector: Injector,
    protected aplicacaoRepository: AplicacoesRepository
  ) {
    super(injector, 'aplicacao', '/aplicacoes');
  }

  mapObjecttoOffiline(values: HttpResponse): Aplicacao[] {
    let result: Array<Aplicacao> = [];
    values.data.map((item: any) => {
      const obj = {
        id: item['id'],
        participanteNome: item['participanteNome'],
        dtAplicacao: item['dtAplicacao'],
      } as Aplicacao;

      if (this.getPlataforma() !== 'web') {
        this.aplicacaoRepository.create(obj).then(() => console.log('CREATED NEW AUTH'));
      }

      result.push(obj);
    });

    return result;
  }
}
