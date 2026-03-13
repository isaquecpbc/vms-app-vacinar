import { Injectable, Injector } from '@angular/core';
import { BaseService, paramsRequest } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Clinica } from '../models/clinica.model';
import { Profissional } from '../models/profissional.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicasProfissionaisService extends BaseService<Profissional> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, 'profissional', '/clinicas/{aditionalId}/profissionais');
  }

  mapObjecttoOffiline(values: HttpResponse): Profissional[] {
    let result: Array<Profissional> = [];
    if (Array.isArray(values)) {
      values.map((item: any) => result.push({
        id: item['id'],
        nome: item['nome'],
        coren: item['coren'],
      } as Profissional));
    }
    else {
      values.data.map((item: any) => result.push({
        id: item['id'],
        nome: item['nome'],
        coren: item['coren'],
      } as Profissional));
    }

    return result;
  }
}
