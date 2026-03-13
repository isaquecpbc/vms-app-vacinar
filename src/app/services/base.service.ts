import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, Injector } from "@angular/core";
import { forkJoin, map, Observable, Subject, tap } from "rxjs";
import { ConnectionStatusService } from "./connection-status.service";
import { environment } from "../../environments/environment";
import Dexie, { Table } from 'dexie';
import { Http, HttpOptions } from '@capacitor-community/http';
import { from } from 'rxjs';
import { HttpResponse } from "@capacitor/core";
import { ApiManagerService } from "./api-manager.service";
import { CampanhasClinicasRepository } from "../repositories/campanhas-clinicas.repository";
import { Clinica } from "../models/clinica.model";

export class filtersParamsRequest {
    [key: string]: string|number;
}

export class payloadParamsRequest {
    [key: string]: string|number;
}

export class querysParamsRequest {
    [key: string]: string|number;
}

export class paramsRequest {
    query?: querysParamsRequest;
    filters?: filtersParamsRequest;
    fakePayload?: payloadParamsRequest;
    aditionalId?: number|string;
}

@Injectable({
    providedIn: 'root'
})
export abstract class BaseService<T extends {id: number|string}> {
    private db!: Dexie;
    private tableItems!: Table<T, any>;

    protected http: HttpClient;
    private statusConnection: ConnectionStatusService;
    private apiManager: ApiManagerService;
    private clinicaRepository: CampanhasClinicasRepository;

    private isConnected = true;
    private apiUrl: string;

    private totalImportaded$ = new Subject<number>();
    private totalRowsTable$ = new Subject<number>();

    constructor(
        protected injector: Injector,
        @Inject(String) protected tableName: string,
        @Inject(String) protected endpoint: string,
    ) {
        this.http = this.injector.get(HttpClient);
        this.statusConnection = this.injector.get(ConnectionStatusService);
        this.apiManager = this.injector.get(ApiManagerService);
        this.clinicaRepository = this.injector.get(CampanhasClinicasRepository);
        this.apiUrl = environment.apiUrl;

        this.ouvirStatusConexao();
        this.iniciarIndexedDb();
    }

    private ouvirStatusConexao() {
        this.statusConnection.statusConexao
          .subscribe(
            online => {
                this.isConnected = online;
                if (online) {
                    this.syncApi();
                }
            });
    }

    iniciarIndexedDb() {
        this.db = new Dexie('db-vms-app');
        this.db.version(1).stores({
            [this.tableName]: 'id'
        });
        this.tableItems = this.db.table(this.tableName);
    }

    post(table: T) {
        if (this.isConnected) {
            this.postApi(table);
        }
        else {
            this.salvarOfflineOneRegistry(table);
        }
    }

    private postApi(table: T) {
        // this.endpoint
    }

    get totalRowsTable(): Observable<number>  {
        return this.totalRowsTable$.asObservable();
    }

    get totalImportaded(): Observable<number> {
        return this.totalImportaded$.asObservable();
    }

    async salvarOffline(...args: paramsRequest[]) {
        const endpoint = this.getEndpoint(...args);
        const options: HttpOptions = {
            method: 'GET',
            url: `${this.apiUrl}${endpoint}`,
            params: { returnType: 'includePagination', per_page: '1000' },
        };

        options.params = Object.assign({}, options.params, this.getFilters(...args));

        const _self = this;
        from(Http.request(options)).subscribe(async res => {
            const mapObjectExternal = this.mapObjecttoOffiline(res.data);
            for (const item of mapObjectExternal) {
                try {
                    await this.tableItems.add(item);
                }
                catch(err) {}
            }

            if(!res.data.pagination) {
                this.totalRowsTable$.next(res.data.length);
                this.totalImportaded$.next(res.data.length);
                return;
            }

            this.totalRowsTable$.next(res.data.pagination.totalRowCount);
            this.totalImportaded$.next(mapObjectExternal.length);

            const options: HttpOptions = {
                method: 'GET',
                url: `${this.apiUrl}${endpoint}`,
                params: {}
            };

            const totalPages = Math.ceil(res.data.pagination.totalRowCount / res.data.pagination.pageSize);
            const limit = 5;
            const requests = [];
            for (let i = 2; i <= totalPages; i++) {
                const params = Object.assign({}, options.params, this.getFilters(...args), {page: `${i}`, per_page: '1000'});
                requests.push(
                from(Http.request(Object.assign({}, options, params)))
                    .pipe(
                        map (res => {
                            const mapObject = this.mapObjecttoOffiline(res);
                            for (const item of mapObject) {
                                this.tableItems.add(item);
                            }
                            this.totalImportaded$.next(+mapObject.length);

                            return res;
                        })
                    )
                );

                if(i >= limit) {
                console.log('limit atingido!');
                break;
                }
            }
            forkJoin(requests).subscribe(
                item => console.log(item)
            )
        });

    }

    async salvarOfflineOneRegistry(table: T) {
        try {
            await this.tableItems.add(table);
            const todosTs: T[] = await this.tableItems.toArray();
        }
        catch (error) {
            console.log('Erro salvar offline', error);
        }
    }

    private async syncApi() {
        // const todosTs: T[] = await this.table.toArray();
        // for (const item of todosTs) {
        //     this.postApi(item);
        //     await this.table.delete(item.id);
        // }
    }

    getFilters(...args: paramsRequest[]) {
        let filters = {};
        if (args && args.length && args[0].filters) {
            const arrFilter = [];
            for (const i of Object.keys(args[0].filters)) {
                arrFilter.push(`${i}:${args[0].filters[i]}`);
            }
            filters = {'filter': arrFilter.join(';')};
        }
        return filters;
    }

    getEndpoint(...args: paramsRequest[]) {
        let endpoint = this.endpoint;
        if(endpoint.match(/aditionalId/) !== null) {
            endpoint = endpoint.replace('{aditionalId}', `${args[0].aditionalId}`);
        }

        return endpoint;
    }
/*
      // add one user with statement
      sqlcmd = `INSERT INTO users (name,email,age,size,company) VALUES ` +
                                `("Brown","Brown@example.com",15,1.75,null)`;
      ret = await db.run(sqlcmd);
      if(ret.changes.lastId !== 4) {
        return Promise.reject(new Error("Run 1 users with statement failed"));
      }
*/
    saveOffLine(...args: paramsRequest[]): Promise<any> {
        const endpoint = this.getEndpoint(...args);
        const url =`${this.apiUrl}${endpoint}`;

        return new Promise(async (resolve, reject) => {
//            await this.clinicaRepository.clear();
            const response = await this.apiManager.storeCallAndRespond('GET', url, '');
            const aValues: Array<Clinica> = [];
            response.data.map((item: any) => aValues.push(item as Clinica));
            await this.clinicaRepository.bulkInsert(aValues);
            console.log('response', response);
            resolve(response);
        });
    }

    getWorkaround(...args: paramsRequest[]): Promise<any> {
        const endpoint = this.getEndpoint(...args);
        const url =`${this.apiUrl}${endpoint}`;

        return new Promise(async (resolve, reject) => {
            const response = await
            this.apiManager.storeCallAndRespond('GET', url, '');
            resolve(response);
        });
    }

    get(id?: string|number|null, ...args: paramsRequest[]): Observable<T> {
        const endpoint = this.getEndpoint(...args);
        const options: HttpOptions = {
            url: `${this.apiUrl}${endpoint}` + (id ? `/${id}` : ''),
            params: {}
        };

        if (args && args[0].fakePayload) {
            const arrFilter = [];
            for (const i of Object.keys(args[0].fakePayload)) {
                arrFilter.push(`${i}:${args[0].fakePayload[i]}`);
            }
            options.params = Object.assign({}, options.params, {'_data': arrFilter.join(';')});
        }

        if (args && args[0].query) {
            const arrQuery = [];
            for (const i of Object.keys(args[0].query)) {
                options.params = Object.assign({}, options.params, {[i]:args[0].query[i]});
            }
        }

        return from(Http.get(options))
            .pipe(
                map (res => {
                    return res.data as T;
                })
            );
    }

    getAll(...args: paramsRequest[]): Observable<T[]> {
        const endpoint = this.getEndpoint(...args);
        const options: HttpOptions = {
            url: `${this.apiUrl}${endpoint}`,
            params: {},
            headers: {timeout: `${60000}`}
            // connectTimeout: 60000,
            // readTimeout: 60000
        };

        options.params = Object.assign({}, options.params, this.getFilters());

        if (args && args[0].fakePayload) {
            const arrFilter = [];
            for (const i of Object.keys(args[0].fakePayload)) {
                arrFilter.push(`${i}:${args[0].fakePayload[i]}`);
            }
            options.params = Object.assign({}, options.params, {'_data': arrFilter.join(';')});
        }

        if (args && args[0].query) {
            const arrQuery = [];
            for (const i of Object.keys(args[0].query)) {
                options.params = Object.assign({}, options.params, {[i]:args[0].query[i]});
            }
        }

        return from(Http.get(options))
            .pipe(
                map (res => {
                    let result: Array<T> = [];
                    res.data.map((item: any) => result.push(item as T));
                    return result;
                })
            );
    }

    mapObject(values: HttpResponse): T[]|T {
        let result: Array<T> = [];
        if (Array.isArray(values.data)) {
            values.data.map((item: any) => result.push(item as T));
        }
        else {
            return values.data as T;
        }
        return result;
    }

    abstract mapObjecttoOffiline(values: HttpResponse): T[];

    createWorkaround(body: T): Observable<T> {
        return this.get(null, {
            fakePayload: body,
            query: { _method: 'POST'}
        });
    }

    create(body: T): Observable<T> {
        const options: HttpOptions = {
            method: 'POST',
            url: `${this.apiUrl}${this.endpoint}`,
            data: body
        };

        return from(Http.request(options))
            .pipe(
                map (res => res.data as T)
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
            data: Object.assign({}, body, {_method: 'PUT', _id: id})
        };

        return from(Http.request(options))
            .pipe(
                map (res => res.data as T)
            );
    }

    delete(id: number): Observable<T> {
        const endpoint = `${this.apiUrl}${this.endpoint}/${id}`;
        return this.http.delete<T>(endpoint);
    }
}
