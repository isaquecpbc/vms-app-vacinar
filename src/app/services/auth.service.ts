import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Auth } from '../models/auth.model';
import { Observable, tap, from, of, catchError, map, firstValueFrom, take, delayWhen, concatMap, merge, mergeMap } from 'rxjs';
import { AuthRepository } from '../repositories/auth.repository';
import { SQLiteService } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService<Auth> {
  // plataforma: string | undefined = 'web';

  constructor(
    protected override injector: Injector,
    private authRepository: AuthRepository,
    // private SQLiteService: SQLiteService
  ) {
    super(injector, 'auth', '/auth');
    //this.plataforma = this.SQLiteService.getPlatform();
  }

  mapObjecttoOffiline(values: HttpResponse): Auth[] {
    let result: Array<Auth> = [];
    values.data.map((item: any) => {
      const obj = {
        id: item['id'],
      } as Auth;

      if (this.getPlataforma() !== 'web') {
        this.authRepository.create(obj).then(() => console.log('CREATED NEW AUTH'));
      }

      result.push(obj);
    });

    return result;
  }

  createWorkaround2(body: Auth): Observable<Auth> {
    return from(this.authRepository.getById(body.login as string))
      .pipe(
        catchError(_ =>
          super.createWorkaround(body)
            .pipe(
              delayWhen(res => from(this.authRepository.create(res)))
            )
        )
      )
  }
}

