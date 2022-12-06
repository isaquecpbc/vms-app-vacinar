import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Clinica } from '../models/clinica.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicasService extends BaseService<Clinica> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, 'clinica', '/clinicas');
  }

  mapObjecttoOffiline(values: HttpResponse): Clinica[] {
    let result: Array<Clinica> = [];
    values.data.map((item: any) => result.push({
      id: item['id'],
    } as Clinica));

    return result;
  }
}
