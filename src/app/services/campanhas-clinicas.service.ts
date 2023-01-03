import { Injectable, Injector } from '@angular/core';
import { BaseService, paramsRequest } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Clinica } from '../models/clinica.model';
import { CampanhasClinicasRepository } from '../repositories/campanhas-clinicas.repository';

@Injectable({
  providedIn: 'root'
})
export class CampanhasClinicasService extends BaseService<Clinica> {

  constructor(
    protected override injector: Injector,
    private clinicaRepository: CampanhasClinicasRepository 
  ) {
    super(injector, 'clinica', '/v2/campanhas/{aditionalId}/clinicas');
  }

  mapObjecttoOffiline(values: HttpResponse): Clinica[] {
    let result: Array<Clinica> = [];
    if (Array.isArray(values)) {
      values.map((item: any) => { 
        const obj = {
          id: item['id'],
          razao: item['razao'],
        } as Clinica;

        if (this.getPlataforma() !== 'web') {
          this.clinicaRepository.create(obj).then(() => console.log('CREATED NEW AUTH'));
        }

        result.push(obj);
      });
    }
    else {
      values.data.map((item: any) => { 
        const obj = {
          id: item['id'],
          razao: item['razao'],
        } as Clinica;

        if (this.getPlataforma() !== 'web') {
          this.clinicaRepository.create(obj).then(() => console.log('CREATED NEW AUTH'));
        }

        result.push(obj);
      });
    }

    return result;
  }
}
