import { Injectable, Injector } from '@angular/core';
import { BaseService, paramsRequest } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Clinica } from '../models/clinica.model';

@Injectable({
  providedIn: 'root'
})
export class CampanhasClinicasService extends BaseService<Clinica> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, 'clinica', '/v2/campanhas/{aditionalId}/clinicas');
  }

  mapObjecttoOffiline(values: HttpResponse): Clinica[] {
    let result: Array<Clinica> = [];
    if (Array.isArray(values)) {
      values.map((item: any) => result.push({
        id: item['id'],
        razao: item['razao'],
      } as Clinica));
    }
    else {
      values.data.map((item: any) => result.push({
        id: item['id'],
        razao: item['razao'],
      } as Clinica));
    }

    return result;
  }
}
