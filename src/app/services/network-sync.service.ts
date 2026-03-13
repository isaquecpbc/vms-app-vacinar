import { Injectable } from "@angular/core";
import { SQLiteService } from "./sqlite.service";
import { environment } from 'src/environments/environment';
import { BulkAplicacao } from "../models/bulk-aplicacao.model";
import { BulkAplicacaoService } from "./bulk-aplicacao.service";
import { catchError, forkJoin, lastValueFrom, of } from "rxjs";
import { Aplicacao } from '../models/aplicacao.model';
import { LocalStorageValues } from "../models/local-storage.model";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

@Injectable({
    providedIn: 'root'
})
export class NetworkSyncService {
    campanhaOffline = environment.CAMPANHA_OFFLINE;
    private log = '';
    private loginUser = '';
    private storagePatrimonio = '';
    public localStorageValues: Array<LocalStorageValues> = [];

    constructor(
        private _sqlite: SQLiteService,
        private bulkAplicacaoService: BulkAplicacaoService,
    ) { }

    getLocalStorageValue(key: string) {
        const result = this.localStorageValues.filter(item => item.key === key);
        return result.length ? result[0].value : null;
    }

    async syncDataFromDB(syncFull = false) {
        console.log('syncDataFromDB');
        let unidadeId: string = '';
        const aIdsEnviados: any[] = [];

        try {
            await this.getLocalStorage();
            // TODO: Validar se a unidade esta sendo retornada
            unidadeId = this.getLocalStorageValue('unidade') || '';
            this.storagePatrimonio = this.getLocalStorageValue('numeroPatrimonio') || '';
            this.loginUser = this.getLocalStorageValue('login_id') || '';

            if (!unidadeId || !this.storagePatrimonio || !this.loginUser) {
                return Promise.resolve({ message: 'Variaveis obrigatórias não encontradas' });
            }

            const aAplicacaoes = await this.getAplicacoes(syncFull);
            const aClinica: Array<any> = [];
            const aRequests: Array<any> = [];

            if (!aAplicacaoes.length) {
                return Promise.resolve({ message: 'SEM APLICAÇÕES PARA SINCRONIZAR' });
            }

            aAplicacaoes.map((aplicacao: Aplicacao) => {
                aIdsEnviados.push({ id: aplicacao.id, codigo: aplicacao.participanteCodigoExterno });
                if (aClinica[aplicacao.conveniadaId] && aClinica[aplicacao.conveniadaId][aplicacao.dtAplicacao]) {
                    aClinica[aplicacao.conveniadaId][aplicacao.dtAplicacao].push(`${aplicacao.participanteCodigoExterno}|${aplicacao.loteId}|${aplicacao.profissionalId}`);
                }
                else {
                    aClinica[aplicacao.conveniadaId] = Object.assign({}, aClinica[aplicacao.conveniadaId], { [aplicacao.dtAplicacao]: [`${aplicacao.participanteCodigoExterno}|${aplicacao.loteId}|${aplicacao.profissionalId}`] });
                    // console.log(`KEYS aClinica[${aplicacao.conveniadaId}]`, this.printJSON(Object.keys(aClinica[aplicacao.conveniadaId])));
                }
            });

            let totalSync = 0;
            aClinica.map((item, idx) => {
                const aDates = Object.keys(item);
                aDates.map(date => {
                    const obj = {
                        mobileNumeroPatrimonio: this.storagePatrimonio,
                        campanhaId: this.campanhaOffline,
                        usuarioNome: this.loginUser,
                        empresaId: idx,
                        dtAplicacao: date,
                        // codigoExternoParticipantes: Object.values(item).toString()
                    } as BulkAplicacao;
                    totalSync += item[date].length;

                    console.log(`TOTAL '${date}': `, this.printJSON(Object.assign({}, obj, { total: item[date].length })));

                    // Limita a quantidade de registros que serão enviados por requisição para o servidor
                    const aValues = item[date];
                    const chunkSize = 60;
                    for (let i = 0; i < aValues.length; i += chunkSize) {
                        const chunk = aValues.slice(i, i + chunkSize);
                        const objClone = Object.assign({}, obj, { codigoExternoParticipantes: chunk.toString() });
                        aRequests.push(this.bulkAplicacaoService.createWorkaround(objClone).pipe(catchError(e => of(false))));
                    }
                });
            });

            console.log('TOTAL REQUESTS: ', aRequests.length);
            if (aRequests.length) {
                this.log += " *** Envio de dados local para o servidor\n";
                this.log += `  > Total enviado para o servidor: ${totalSync}\n`;
            }

            const resultados: any[] = await lastValueFrom(forkJoin(aRequests));
            console.log('RESULTADOS', this.printJSON(resultados));

            if (syncFull) {
                return Promise.resolve(true);
            }

            // Verifica se alguma requisição retornou false (catchError retorna of(false))
            const aError = resultados.filter(item => item === false);
            if (aError.length) {
                console.warn(`${aError.length} requisições falharam`);
            }

            // Verifica se alguma resposta contém Exception da API
            const hasException = resultados.some(item => item && item.class === 'Exception');
            if (hasException) {
                console.warn('Tratamento individualizado para status 406.');
                return Promise.resolve(false);
            }

            // Processa os resultados válidos (exclui os false do catchError)
            const resultadosValidos = resultados.filter(item => item !== false);
            const oResult: { aSuccess: any[]; aFail: any[] } = this.proccessReturn(aIdsEnviados, resultadosValidos);

            if (oResult.aSuccess.length) {
                console.log('ENTROU-SUCCESS', oResult.aSuccess.length);
                await this.updateAplicacao(1, 'SUCCESS', oResult.aSuccess);
                console.log('sucesso-update-success');
            }

            if (oResult.aFail.length) {
                console.log('ENTROU-FAIL', oResult.aFail.length);
                await this.updateAplicacao(2, 'FAIL', oResult.aFail);
                console.log('sucesso-update-fail');
            }

            return Promise.resolve(resultados);

        } catch (err) {
            return Promise.reject(err);
        }
    }

    proccessReturn(aIdsEnviados: Array<any>, aReturn: Array<any>) {
        const aResultSuccess = ['Aplicação Atualizada com sucesso', 'Ja existe data de aplicação para esse participante'];
        const aSuccess: any[] = [];
        const aFail: any[] = [];
        for (let i = 0; i < aReturn.length; i++) {
            console.log('aReturn', this.printJSON(aReturn));

            aReturn[i].map((item: { mensagem: string; participante: any; }) => {
                const hasSuccess = aResultSuccess.indexOf(item.mensagem) >= 0;
                const filtered = aIdsEnviados.filter(val => {
                    let codigo = new String(val.codigo);
                    const re2 = new RegExp("^PT\-", "g");
                    codigo = codigo.replace(re2, '');

                    return codigo == item.participante
                });

                if (hasSuccess) {
                    aSuccess.push(filtered[0].id);
                }
                else {
                    aFail.push(filtered[0].id);
                }
            });
        }

        return { aSuccess: aSuccess, aFail: aFail };
    }

    async getLocalStorage() {
        if (this.localStorageValues.length) {
            return Promise.resolve();
        }

        try {
            let result: any = await this._sqlite.echo("Hello World");

            const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
            if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
            await db1.open();

            result = await db1.query("SELECT * FROM localStorage");
            // console.log('Saved Information', this.printJSON(result.values));
            if (result.values.length) {
                this.localStorageValues = result.values;
            }

            this.log += "  > O Banco de Dados existe no dispositivo atual\n";
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
        finally {
            await this._sqlite.closeConnection(environment.DB_NAME);
        }
    }

    async getAplicacoes(syncFull: boolean) {
        let db1: SQLiteDBConnection;
        let returnResult = [];

        try {
            let result: any = await this._sqlite.echo("Hello World");

            db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
            if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
            await db1.open();

            let strQuery = 'SELECT * from aplicacao where (loteId is not null and loteId <> 0)';
            if (!syncFull) {
                strQuery += ' AND (status = 2 OR status is null)';
            }

            result = await db1.query(strQuery); // AND status <> 1
            if (result.values.length > 0) {
                returnResult = result.values;
            }

            return Promise.resolve(returnResult);
        } catch (err) {
            return Promise.reject(err);
        }
        finally {
            await this._sqlite.closeConnection(environment.DB_NAME);
        }
    }

    async updateAplicacao(status: number, message: string, aIds: any[]) {
        let db1: any;
        try {
            let result: any = await this._sqlite.echo("Hello World");

            db1 = await this._sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
            if (db1 == null) throw new Error(" X Falha ao criar o banco de dados localmente");
            await db1.open();

            // Construa a cláusula IN dinamicamente
            const inClause = aIds.map(id => `'${id}'`).join(',');
            const dtSync = new Date(await db1.getSyncDate()).getTime();
            let sqlcmd: string = `UPDATE aplicacao set status = ?, message = ?, last_modified = ? where id IN (${inClause})`;
            let values: Array<any> = [status, message, dtSync];
            let ret: any = await db1.run(sqlcmd, values);
            console.log('values', values);
            console.log('ret', ret);
            if (ret.changes.changes > 0) {
                console.log('ATUALIZADO APLICACAO - OK');
                return Promise.resolve('ret.changes');
            }

            throw Error('Update Aplicacao com retorno');
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    printJSON(val: any) {
        try {
            // Safe stringify that handles Symbols and circular references
            return JSON.stringify(val, (key, value) => {
                // Filter out Symbol properties
                if (typeof value === 'symbol') {
                    return String(value);
                }
                return value;
            }, 2);
        } catch (error: any) {
            // Fallback if stringify fails
            return `[Unable to stringify: ${error?.message || 'unknown error'}]`;
        }
    }

    getLog() {
        return this.log;
    }
}