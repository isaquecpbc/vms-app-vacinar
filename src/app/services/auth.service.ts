import { Injectable, Injector } from '@angular/core';
import { BaseService } from './base.service';
import { HttpResponse } from '@capacitor/core';
import { Auth } from '../models/auth.model';
import { Observable, tap, from, of, catchError, map, firstValueFrom, take, delayWhen, concatMap, merge, mergeMap } from 'rxjs';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService<Auth> {

  constructor(
    protected override injector: Injector,
    private authRepository: AuthRepository
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

  createWorkaround2(body: Auth): Observable<Auth> {
    return from(this.authRepository.getById(body.login as string))
      .pipe(
        catchError(_ =>
          super.createWorkaround(body)
            .pipe(
              delayWhen(res => from(this.authRepository.create(res))),
            )
        )
      )
      // tap(async res => await this.authRepository.create(res)),

    //   (reason) => {
        // return super.createWorkaround(body)
        //   .pipe(
        //     tap( res => this.authRepository.create(res))
        //   )
    //   }
    // ));
      // .pipe (
      //   tap( res => Observable.create(res))
      // )
    // .then((res) => {
    //     return ;
    //   },
    //   (reason) => {
    //     return super.createWorkaround(body)
    //       .pipe(
    //         tap( res => this.authRepository.create(res))
    //       )
    //   },
    // ));
    //   // @ts-ignore
    // return response;
  }
}
