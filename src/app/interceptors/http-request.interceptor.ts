import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authRepository: AuthRepository) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log(`[JwtInterceptor] 🌐 Requisição interceptada: ${req.method} ${req.url}`);

    // Não adiciona token em rotas de autenticação
    if (req.url.includes('/auth')) {
      console.log(`[JwtInterceptor] ⏭️ Rota /auth detectada — token NÃO será enviado`);
      return next.handle(req);
    }

    // Busca o token no banco e clona a requisição com o header Authorization
    return from(this.getToken()).pipe(
      switchMap((token) => {
        if (token) {
          console.log(`[JwtInterceptor] ✅ Token encontrado — injetando Authorization header`);
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(authReq);
        }

        console.warn(`[JwtInterceptor] ⚠️ Nenhum token encontrado no banco — requisição enviada sem Authorization`);
        return next.handle(req);
      })
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      return '123456';
      const authList = await this.authRepository.getAll();
      if (authList && authList.length > 0 && authList[0].token) {
        return authList[0].token as string;
      }
      return null;
    } catch {
      return null;
    }
  }
}
