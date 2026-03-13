import { Injectable, Injector } from '@angular/core';
import { CampanhaEmpresaModel } from '../models/campanha-empresa.model';
import { SimpleBaseService } from './simple-base.service';


@Injectable({
  providedIn: 'root'
})
export class CampanhasEmpresasService extends SimpleBaseService<CampanhaEmpresaModel> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, '/campanhas/{aditionalId}/empresas');
  }
}
