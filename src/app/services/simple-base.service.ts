import { HttpClient } from "@angular/common/http";
import { inject, Inject, Injectable, Injector } from "@angular/core";
import { catchError, forkJoin, from, map, Observable, Subject, switchMap, tap, throwError } from "rxjs";
import { ConnectionStatusService } from "./connection-status.service";
import { environment } from "../../environments/environment";
import { Http, HttpOptions } from '@capacitor-community/http';
import { HttpResponse } from "@capacitor/core";
import { AuthRepository } from "../repositories/auth.repository";
import { LocalStorageValues } from "../models/local-storage.model";
import { LocalStorageDBService } from "./localstorage-db.service";

export class filtersParamsRequest {
    [key: string]: string | number;
}

export class payloadParamsRequest {
    [key: string]: string | number;
}

export class querysParamsRequest {
    [key: string]: string | number;
}

export class paramsRequest {
    query?: querysParamsRequest;
    filters?: filtersParamsRequest;
    aFilters?: Array<filtersParamsRequest>;
    fakePayload?: payloadParamsRequest;
    aditionalId?: number | string;
}

@Injectable({
    providedIn: 'root'
})
export abstract class SimpleBaseService<T extends { id: number | string }> {

    protected http: HttpClient;
    private apiUrl: string;
    private authRepository: AuthRepository;
    public localStorageValues: Array<LocalStorageValues> = [];
    private localStorageDBService = inject(LocalStorageDBService);

    /** Cache em memória do token JWT para evitar múltiplas leituras do SQLite em paralelo */
    private _cachedToken: string | null = null;
    private _cachedTokenAt: number = 0;
    private readonly TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutos

    /**
     * Promise compartilhada (in-flight deduplication):
     * Se múltiplas chamadas paralelas (forkJoin) chegam ao mesmo tempo e o cache
     * ainda está vazio, todas aguardam a MESMA Promise em vez de cada uma tentar
     * abrir uma conexão SQLite — o que causava "connection busy" e falha no header.
     */
    private _tokenFetchPromise: Promise<string | null> | null = null;

    constructor(
        protected injector: Injector,
        @Inject(String) protected endpoint: string,
    ) {
        this.http = this.injector.get(HttpClient);
        this.authRepository = this.injector.get(AuthRepository);
        this.apiUrl = environment.apiUrl;
    }

    /** Busca o JWT token com in-flight deduplication:
     *  - Se o cache está válido → retorna imediatamente sem tocar no SQLite
     *  - Se uma busca já está em andamento (forkJoin paralelo) → aguarda a mesma Promise
     *  - Caso contrário → inicia a busca no SQLite e compartilha a Promise com quem chegar depois
     */
    private async getAuthHeaders(): Promise<Record<string, string>> {
        try {
            const now = Date.now();
            const cacheValido = this._cachedToken && (now - this._cachedTokenAt) < this.TOKEN_TTL_MS;

            if (!cacheValido) {
                // Se não há busca em andamento, inicia uma e a compartilha
                if (!this._tokenFetchPromise) {
                    this._tokenFetchPromise = this.localStorageDBService.getItem('login_token')
                        .then(token => {
                            this._cachedToken = token;
                            this._cachedTokenAt = Date.now();
                            this._tokenFetchPromise = null; // libera para a próxima vez
                            console.log('[SimpleBaseService] 🔄 Token lido do SQLite e cacheado');
                            return token;
                        })
                        .catch(err => {
                            this._tokenFetchPromise = null; // libera em caso de erro
                            console.error('[SimpleBaseService] ❌ Erro ao buscar token:', err);
                            return null;
                        });
                }
                // Todas as chamadas paralelas aguardam a mesma Promise
                await this._tokenFetchPromise;
            }

            if (this._cachedToken) {
                return { Authorization: `Bearer ${this._cachedToken}` };
            }
            console.warn('[SimpleBaseService] ⚠️ Nenhum token encontrado');
        } catch (err) {
            console.error('[SimpleBaseService] ❌ Erro ao buscar token');
        }
        return {};
    }

    /** Força a invalidação do cache (chamar após logout ou troca de usuário) */
    clearTokenCache() {
        this._cachedToken = null;
        this._cachedTokenAt = 0;
        this._tokenFetchPromise = null;
    }


    getFilters(...args: paramsRequest[]) {
        let filters = {};
        console.log('aFilters', args[0].aFilters);
        if (args && args.length) {
            const arrFilter = [];
            if (args[0].filters) {
                for (const i of Object.keys(args[0].filters)) {
                    arrFilter.push(`${i}:${args[0].filters[i]}`);
                }
            }

            if (args[0].aFilters && args[0].aFilters.length) {
                args[0].aFilters.map(item => {
                    for (const i of Object.keys(item)) {
                        arrFilter.push(`${i}:${item[i]}`);
                    }
                })
            }

            filters = { 'filter': arrFilter.join(';') };
        }
        return filters;
    }

    getEndpoint(...args: paramsRequest[]) {
        let endpoint = this.endpoint;
        if (endpoint.match(/aditionalId/) !== null) {
            endpoint = endpoint.replace('{aditionalId}', `${args[0].aditionalId}`);
        }

        return endpoint;
    }

    get(id?: string | number | null, ...args: paramsRequest[]): Observable<T> {
        const endpoint = this.getEndpoint(...args);
        const options: HttpOptions = {
            url: `${this.apiUrl}${endpoint}` + (id ? `/${id}` : ''),
            headers: {},
            params: {}
        };

        if (args && args[0].fakePayload) {
            const arrFilter = [];
            for (const i of Object.keys(args[0].fakePayload)) {
                arrFilter.push(`${i}:${args[0].fakePayload[i]}`);
            }
            options.params = Object.assign({}, options.params, { '_data': arrFilter.join(';') });
        }

        if (args && args[0].query) {
            const arrQuery = [];
            for (const i of Object.keys(args[0].query)) {
                options.params = Object.assign({}, options.params, { [i]: args[0].query[i] });
            }
        }

        return from(this.getAuthHeaders()).pipe(
            switchMap(authHeaders => {
                options.headers = Object.assign({}, options.headers, authHeaders);
                console.log(`[SimpleBaseService] 🌐 GET ${options.url}`);
                return from(Http.get(options)).pipe(
                    map(res => res.data as T)
                );
            })
        );
    }

    getAll(...args: paramsRequest[]): Observable<T[]> {
        const endpoint = this.getEndpoint(...args);
        const options: HttpOptions = {
            url: `${this.apiUrl}${endpoint}`,
            headers: {},
            params: {}
        };

        options.params = Object.assign({}, options.params, this.getFilters(...args));

        if (args && args[0].fakePayload) {
            const arrFilter = [];
            for (const i of Object.keys(args[0].fakePayload)) {
                arrFilter.push(`${i}:${args[0].fakePayload[i]}`);
            }
            options.params = Object.assign({}, options.params, { '_data': arrFilter.join(';') });
        }

        if (args && args[0].query) {
            const arrQuery = [];
            for (const i of Object.keys(args[0].query)) {
                options.params = Object.assign({}, options.params, { [i]: args[0].query[i] });
            }
        }

        return from(this.getAuthHeaders()).pipe(
            switchMap(authHeaders => {
                options.headers = Object.assign({}, options.headers, authHeaders);
                console.log(`[SimpleBaseService] 🌐 GET ALL ${options.url}`);
                return from(Http.get(options)).pipe(
                    map(res => {
                        let result: Array<T> = [];
                        res.data.map((item: any) => result.push(item as T));
                        return result;
                    }),
                    catchError((error: any) => {
                        console.error('Error in getAll:', error);
                        if (error.status) {
                            console.error('Error Status Code:', error.status);
                        }
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    mapObject(values: HttpResponse): T[] | T {
        let result: Array<T> = [];
        if (Array.isArray(values.data)) {
            values.data.map((item: any) => result.push(item as T));
        }
        else {
            return values.data as T;
        }
        return result;
    }

    createWorkaround(body: T): Observable<T> {
        return this.get(null, {
            fakePayload: body,
            query: { _method: 'POST' }
        });
    }

    create(body: T): Observable<T> {
        const options: HttpOptions = {
            method: 'POST',
            url: `${this.apiUrl}${this.endpoint}`,
            data: body,
            headers: {}
        };

        return from(this.getAuthHeaders()).pipe(
            switchMap(authHeaders => {
                options.headers = Object.assign({}, options.headers, authHeaders);
                console.log(`[SimpleBaseService] 🌐 POST ${options.url}`);
                return from(Http.request(options)).pipe(
                    map(res => res.data as T)
                );
            })
        );
    }

    updateWorkaround(id: number, body: T): Observable<T> {
        return this.get(null, {
            fakePayload: body,
            query: { _method: 'PUT', _id: id }
        });
    }

    update(id: number, body: T): Observable<T> {
        const options: HttpOptions = {
            method: 'POST',
            url: `${this.apiUrl}${this.endpoint}`,
            data: Object.assign({}, body, { _method: 'PUT', _id: id }),
            headers: {}
        };

        return from(this.getAuthHeaders()).pipe(
            switchMap(authHeaders => {
                options.headers = Object.assign({}, options.headers, authHeaders);
                console.log(`[SimpleBaseService] 🌐 PUT ${options.url}`);
                return from(Http.request(options)).pipe(
                    map(res => res.data as T)
                );
            })
        );
    }

    delete(id: number): Observable<T> {
        const endpoint = `${this.apiUrl}${this.endpoint}/${id}`;
        return this.http.delete<T>(endpoint);
    }
}