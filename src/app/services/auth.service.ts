import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Auth } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService<Auth> {

  constructor(
    protected override injector: Injector
  ) {
    super(injector, 'auth', '/auth');
  }

  mapObjecttoOffiline(values: HttpResponse): Auth[] {
    let result: Array<Auth> = [];
    values.data.map((item: any) => result.push({
      id: item['id'],
    } as Auth));

    return result;
  }
}
