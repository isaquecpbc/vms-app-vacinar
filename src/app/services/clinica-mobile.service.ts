import { Injectable, Injector } from '@angular/core';
import { Mobile } from '../models/mobile.model';
import { SimpleBaseService } from './simple-base.service';

@Injectable({
  providedIn: 'root'
})
export class ClinicaMobileService extends SimpleBaseService<Mobile> {

  constructor(
    protected override injector: Injector,
  ) {
    super(injector, '/clinicas/{aditionalId}/mobiles');
  }

}
