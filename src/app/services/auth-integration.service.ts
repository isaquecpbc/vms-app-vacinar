import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { Observable, Subject } from 'rxjs';
import { LocalStoragePreferencesService } from './localstorage-preferences.service';
import { LocalStorageJessieService } from './locastorage-jessie.service';
import { SQLiteService } from './sqlite.service';
import { AuthService } from './auth.service';
import { Auth } from '../models/auth.model';
import { Network } from "@capacitor/network";
import { Http } from '@capacitor-community/http';
import jwtDecode from 'jwt-decode';
import { environment } from 'src/environments/environment';
import { AuthRepository } from '../repositories/auth.repository';
import { CripytexService } from './cripytex.service';

export interface IUsuario {
  id?: number;
  campanhaId: string;
  company: string;
  login: string;
  nome?: string;
  permission: string;
  token: string;
  role: string;
  validado: number; // 1 = validado, 0 = não
  last_modified?: number;
  sql_deleted?: number;
}

export enum TYPE {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  QUESTION = 'question'
}

@Injectable({
  providedIn: 'root'
})
export class AuthIntegrationService {
  localStorage: LocalStoragePreferencesService | LocalStorageJessieService;
  private authenticationIsValid$ = new Subject<boolean>();

  /** URL do endpoint de autenticação — usa a apiUrl do environment */
  private readonly API_URL = `${environment.apiUrl}/auth`;

  constructor(
    private localStoragePreferences: LocalStoragePreferencesService,
    private localStorageJessie: LocalStorageJessieService,
    private authService: AuthService,
    private SQLiteService: SQLiteService,
    private authRepository: AuthRepository,
    private cripytex: CripytexService,
  ) {
    const plataforma = this.SQLiteService.getPlatform();
    this.localStorage = plataforma === 'web' ? this.localStoragePreferences : this.localStorageJessie;
  }

  /**
   * Realiza login online (via API) ou offline (via banco SQLite local).
   *
   * - Online:  POST /auth → decodifica JWT → retorna IUsuario
   * - Offline: busca na tabela `auth` do SQLite e valida senha descriptografada
   *
   * @returns IUsuario em sucesso, ou false em falha
   */
  async login(email: string, password: string): Promise<IUsuario | false> {
    const { connected } = await Network.getStatus();
    console.log('[AuthIntegrationService] Conexão:', connected ? 'online' : 'offline');

    if (connected) {
      // ----- LOGIN ONLINE via API -----
      try {
        console.log('[AuthIntegrationService] Tentando login online para:', email);

        // Usa Capacitor Http para evitar Mixed Content (HTTP vs HTTPS no WebView)
        // params: {} é obrigatório — Capacitor Http chama .keys() nele e quebra se for null no Android
        const res = await Http.post({
          url: this.API_URL,
          data: { login: email, password, system: 'auth-vms' },
          headers: { 'Content-Type': 'application/json' },
          params: {},
        });

        console.log('[AuthIntegrationService] Resposta da API:', JSON.stringify(res.data, null, 2));

        const tokenDecoded = this.getDecodedToken(res.data?.token);
        console.log('[AuthIntegrationService] Token decodificado:', JSON.stringify(tokenDecoded, null, 2));

        if (!tokenDecoded) {
          console.error('[AuthIntegrationService] Falha ao decodificar token');
          return false;
        }

        const usuario: IUsuario = {
          id: tokenDecoded.sub,
          login: tokenDecoded.login ?? email,
          nome: tokenDecoded.nome,
          token: res.data?.token,
          validado: 1,
          campanhaId: tokenDecoded.campanhaId || '',
          company: tokenDecoded.company || '',
          permission: tokenDecoded.permission || '',
          role: tokenDecoded.role || '',
        };

        console.log('[AuthIntegrationService] ✅ Login online bem-sucedido');
        return usuario;

      } catch (e) {
        console.error('[AuthIntegrationService] ❌ Erro no login online:', JSON.stringify(e));
        return false;
      }

    } else {
      // ----- LOGIN OFFLINE via banco SQLite local -----
      try {
        console.log('[AuthIntegrationService] Tentando login offline para:', email);
        const authRecord = await this.authRepository.getById(email);

        if (!authRecord || !authRecord.login) {
          console.warn('[AuthIntegrationService] Usuário não encontrado no banco local');
          return false;
        }

        const senhaDecod = this.cripytex.decode(authRecord.password);
        if (senhaDecod !== password) {
          console.warn('[AuthIntegrationService] Senha incorreta no banco local');
          return false;
        }

        const usuario: IUsuario = {
          login: authRecord.login,
          nome: authRecord.nome,
          token: authRecord.token || '',
          validado: 1,
          campanhaId: authRecord.conveniadaId || '',
          company: '',
          permission: '',
          role: '',
        };

        console.log('[AuthIntegrationService] ✅ Login offline bem-sucedido');
        return usuario;

      } catch (e) {
        console.error('[AuthIntegrationService] ❌ Erro no login offline:', e);
        return false;
      }
    }
  }

  getDecodedToken(token: string): any | null {
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<any>(token);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  logout() {
    this.localStorage.clear();
  }

  getTokenApp() {
    const auth = {
      user: 'qrcode',
      password: '1_0pLq35.i7S',
      system: 'auth-add-patient'
    } as unknown as Auth;
    console.log('GetTokenApp', JSON.stringify(auth));
    this.authService.createWorkaround(auth).subscribe(
      async data => {
        console.debug('LOGIN API!', JSON.stringify(data));
        console.log('resp', JSON.stringify(data));
      },
      err => {
        console.error('err login (GetTokenApp)', JSON.stringify(err));
      }
    );
  }

  setToken(token: string) {
    if (!token.length) {
      throw Error('Sem conteúdo para setar o token');
    }
    this.localStorage.setItem('token', token);
  }

  async isAuthenticated() {
    const status = this.tokenIsValid();
    this.authenticationIsValid$.next(await status);
    return status;
  }

  async getToken() {
    const token = await this.localStorage.getItem('token');
    console.log('token', token);
    return token !== null ? `${token}` : '';
  }

  async tokenIsValid() {
    let result = false;
    try {
      const token = this.getDecodedAccessToken(await this.getToken());
      const date = new Date(token.exp * 1000);
      result = new Date() < date;
    }
    catch (Error) { }
    return result;
  }

  private getDecodedAccessToken(token: string): any {
    let result = null;
    try {
      result = jwt_decode(token);
    }
    catch (Error) { }
    return result;
  }

  get statusAuthentication(): Observable<boolean> {
    return this.authenticationIsValid$.asObservable();
  }
}
