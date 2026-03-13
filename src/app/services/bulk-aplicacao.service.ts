import { Injectable, Injector } from '@angular/core';
import { SimpleBaseService } from './simple-base.service';
import { BulkAplicacao } from '../models/bulk-aplicacao.model';

@Injectable({
  providedIn: 'root'
})
export class BulkAplicacaoService extends SimpleBaseService<BulkAplicacao> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, '/bulk/aplicacao');
  }

}
