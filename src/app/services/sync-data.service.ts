import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { CripytexService } from './cripytex.service';
import { ClinicasProfissionaisService } from './clinicas-profissionais.service';
import { paramsRequest } from './base.service';
import { environment } from 'src/environments/environment';
import { Aplicacao } from '../models/aplicacao.model';
import { Profissional } from '../models/profissional.model';
import { CampanhasEmpresasService } from './campanhas-empresas.service';
import { UnidadeModel } from '../models/unidade.model';
import { CampanhasLotesService } from './campanhas-lotes.service';
import { Lote } from '../models/lote.model';
import { CampanhasAplicacoesService } from './campanhas-aplicacoes.service';

@Injectable({
    providedIn: 'root'
})
export class SyncDataService {
    campanhaOffline = environment.CAMPANHA_OFFLINE;

    constructor(
        private _sqlite: SQLiteService,
        private campanhasAplicacoesService: CampanhasAplicacoesService,
        private cripytex: CripytexService,
        private clinicasProfissionaisService: ClinicasProfissionaisService,
        private campanhasEmpresasService: CampanhasEmpresasService,
        private campanhasLotesService: CampanhasLotesService,
    ) { }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    printJSON(val: any): string {
        try {
            return JSON.stringify(val, (key, value) => typeof value === 'symbol' ? String(value) : value, 2);
        } catch (error: any) {
            return `[Unable to stringify: ${error?.message || 'unknown error'}]`;
        }
    }

    limparStringParaBancoDeDados(input: string | undefined | null): string {
        if (!input) return '';
        const caracteresPermitidos = /[^ a-zA-ZÀ-ÖØ-öø-ÿ0-9_\-]/g;
        return input.replace(caracteresPermitidos, '');
    }

    // ─── API ──────────────────────────────────────────────────────────────────────

    /**
     * Obtém o maior id de aplicação presente no banco local.
     * Ignora aplicações realizadas com token (participanteCodigoExterno like 'PT-%').
     * Método interno — use syncAplicacoes() a partir do componente.
     */
    private async getLastIdAplicacao(): Promise<number> {
        try {
            await this._sqlite.echo('Hello World');

            const db1 = await this._sqlite.createConnection(environment.DB_NAME, false, 'no-encryption', 1);
            if (db1 == null) throw new Error('X Falha ao criar o banco de dados localmente');
            await db1.open();

            const sqlcmd = "SELECT MAX(id) as max_id FROM aplicacao WHERE participanteCodigoExterno NOT LIKE 'PT-%' LIMIT 1";
            const result = await db1.query(sqlcmd);
            console.log('getLastIdAplicacao - result.values', result.values);

            await this._sqlite.closeConnection(environment.DB_NAME);

            return result.values?.length ? result.values[0]['max_id'] ?? 0 : 0;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Insere em lote um array de registros em qualquer tabela do banco local.
     * Usa INSERT OR IGNORE com colunas derivadas das chaves do primeiro objeto.
     * Os registros são quebrados em chunks de `chunkSize` (default 500) para
     * evitar queries excessivamente longas que causam erros no SQLite.
     * @param tableName Nome da tabela SQLite de destino
     * @param records Array de objetos a inserir (todos devem ter as mesmas chaves)
     * @param chunkSize Número máximo de registros por INSERT (default 500)
     */
    private async bulkInsert<T extends object>(tableName: string, records: Array<T>, chunkSize = 500): Promise<number> {
        console.log('SyncDataService.bulkInsert - tableName');
        console.log('SyncDataService.bulkInsert - records');
        if (!records.length) return Promise.resolve(0);

        try {
            console.log('SyncDataService.bulkInsert - records.length', records.length);

            await this._sqlite.echo('Hello World');

            let db1: any;
            const isConnection = await this._sqlite.checkConnectionsConsistency();

            console.log('SyncDataService.bulkInsert - isConnection', isConnection);

            if (isConnection.result) {
                db1 = await this._sqlite.retrieveConnection(environment.DB_NAME);
            } else {
                db1 = await this._sqlite.createConnection(environment.DB_NAME, false, 'no-encryption', 1);
                if (db1 == null) throw new Error('X Falha ao criar o banco de dados localmente');
                await db1.open();
            }

            console.log('SyncDataService.bulkInsert - db1');

            const cols = Object.keys(records[0]).join(',');
            let totalInserted = 0;

            for (let i = 0; i < records.length; i += chunkSize) {
                const chunk = records.slice(i, i + chunkSize);
                const aValues: Array<string> = [];
                chunk.forEach(val => {
                    const sanitized = Object.values(val).map(v => String(v ?? '').replace(/'/g, ''));
                    aValues.push(`('` + sanitized.join("','") + `')`);
                });

                const query = `INSERT OR IGNORE INTO ${tableName} (${cols}) VALUES ${aValues.join(',')}`;
                console.log(`bulkInsert [${tableName}] chunk ${i / chunkSize + 1} (${chunk.length} registros)`);

                const res: any = await db1.execute(query);
                if (res.changes && res.changes.changes > 0) {
                    totalInserted += res.changes.changes;
                }
            }

            console.log(`bulkInsert [${tableName}] total inserido: ${totalInserted}`);
            return Promise.resolve(totalInserted);
        } catch (err) {
            return Promise.reject(err);
        } finally {
            await this._sqlite.closeConnection(environment.DB_NAME);
        }
    }

    /**
     * Sincroniza aplicações: busca o último id local e baixa da API
     * todos os registros com id maior, persistindo-os no banco.
     * @param limitDownloadPartials Limite de registros por página (default 5000)
     * @returns Promise com { total, hasConnection }
     */
    async syncAplicacoes(limitDownloadPartials = 5000): Promise<{ total: number; hasConnection: boolean }> {
        let maxId = 0;
        try {
            maxId = await this.getLastIdAplicacao();
        } catch (err) {
            console.warn('syncAplicacoes - erro ao obter lastId, continuando com 0', err);
        }

        console.log('SyncDataService.syncAplicacoes - maxId', maxId);

        const filters = {
            'aplicados': 'no',
            'campanhaId': environment.CAMPANHA_OFFLINE,
            'idMoreThan': (maxId + 1)
        };

        const params = {
            query: { per_page: limitDownloadPartials },
            filters,
            aditionalId: environment.CAMPANHA_OFFLINE
        } as paramsRequest;

        return new Promise((resolve, reject) => {
            this.campanhasAplicacoesService
                .getAll(params)
                .subscribe({
                    next: async (response) => {
                        const aAplicacao: Array<Aplicacao> = [];
                        console.log('SyncDataService.syncAplicacoes - response', this.printJSON(response));

                        if (response.length) {
                            response.forEach(item => {
                                if (!item?.id) return;
                                aAplicacao.push({
                                    id: item.id,
                                    participanteNome: this.limparStringParaBancoDeDados(this.cripytex.decode(item.participanteNome)),
                                    participanteCodigoExterno: item.participanteCodigoExterno,
                                    participanteMatricula: item.participanteMatricula,
                                    participanteTipo: item.participanteTipo.toUpperCase(),
                                    dtNascimento: item.participanteDtNascimento,
                                    participanteCpf: this.cripytex.decode(item.participanteCpf),
                                    conveniadaId: item.participanteEmpresaId,
                                } as unknown as Aplicacao);
                            });
                            console.log('SyncDataService.syncAplicacoes - aAplicacao', this.printJSON(aAplicacao));

                            try {
                                console.log('SyncDataService.syncAplicacoes - aAplicacao.length - CHEGOU AQUI');
                                await this.bulkInsert('aplicacao', aAplicacao);
                                console.log('SyncDataService.syncAplicacoes - aAplicacao.length - PASSOU');
                                resolve({ total: aAplicacao.length, hasConnection: true });
                            } catch (err) {
                                reject(err);
                            }
                        } else {
                            resolve({ total: 0, hasConnection: true });
                        }
                    },
                    error: (err) => {
                        console.log('SyncDataService.syncAplicacoes - err', this.printJSON(err));
                        resolve({ total: 0, hasConnection: false });
                    }
                });
        });
    }
    /**
     * Busca novos profissionais da API e persiste no banco local.
     * @param conveniadaId ID da conveniada para filtrar profissionais
     * @returns Promise com { total, hasConnection }
     */
    async getNovosProfissionais(conveniadaId: number): Promise<{ total: number; hasConnection: boolean }> {
        const params = {
            query: { per_page: '1000' },
            aditionalId: conveniadaId
        } as paramsRequest;

        return new Promise((resolve) => {
            this.clinicasProfissionaisService
                .getAll(params)
                .subscribe({
                    next: async (response) => {
                        const aProfissional: Array<Profissional> = [];
                        console.log('SyncDataService.getNovosProfissionais - response', JSON.stringify(response));

                        if (response.length) {
                            response.forEach(item => {
                                if (!item?.id) return;
                                aProfissional.push({
                                    id: item.id,
                                    conveniadaId: item.conveniadaId,
                                    nome: this.limparStringParaBancoDeDados(item.nome),
                                    coren: this.limparStringParaBancoDeDados(item.coren),
                                    cpf: this.limparStringParaBancoDeDados(item.cpf)
                                } as unknown as Profissional);
                            });

                            try {
                                await this.bulkInsert('profissional', aProfissional);
                                resolve({ total: aProfissional.length, hasConnection: true });
                            } catch (err) {
                                resolve({ total: 0, hasConnection: true });
                            }
                        } else {
                            resolve({ total: 0, hasConnection: true });
                        }
                    },
                    error: (err) => {
                        console.log('SyncDataService.getNovosProfissionais - err', this.printJSON(err));
                        resolve({ total: 0, hasConnection: false });
                    }
                });
        });
    }

    async getNovasUnidades(): Promise<{ total: number; hasConnection: boolean }> {

        const seteDiasAtrasISO = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        const filters = { 'dataInicial': seteDiasAtrasISO };

        const params = {
            query: { per_page: '1000' },
            filters,
            aditionalId: environment.CAMPANHA_OFFLINE
        } as paramsRequest;

        console.log('============= >>>> getNovasUnidades');

        return new Promise((resolve) => {
            this.campanhasEmpresasService
                .getAll(params)
                .subscribe({
                    next: async (response) => {
                        const aUnidade: Array<UnidadeModel> = [];
                        if (response.length) {
                            response.forEach(item => {
                                if (item?.empresaPaiId && item?.empresaFilhaId && Number(item?.empresaPaiId) !== 130) {
                                    aUnidade.push({
                                        id: item?.empresaFilhaId,
                                        id_clinica: item?.empresaPaiId,
                                        razao: this.limparStringParaBancoDeDados(item?.empresaFilhaRazao),
                                        cep: item?.empresaFilhaCep,
                                        rua: this.limparStringParaBancoDeDados(item?.empresaFilhaRua),
                                        numero: item?.empresaFilhaNumero,
                                    } as unknown as UnidadeModel);
                                }
                            });

                            try {
                                await this.bulkInsert('unidade', aUnidade);
                                resolve({ total: aUnidade.length, hasConnection: true });
                            } catch (err) {
                                resolve({ total: 0, hasConnection: true });
                            }
                        } else {
                            resolve({ total: 0, hasConnection: true });
                        }
                    },
                    error: (err) => {
                        console.log('SyncDataService.getNovasUnidades - err', this.printJSON(err));
                        resolve({ total: 0, hasConnection: false });
                    }
                });
        });
    }

    async getNovosLotes(): Promise<{ total: number; hasConnection: boolean }> {
        const params = {
            query: { per_page: '1000' },
            aditionalId: environment.CAMPANHA_OFFLINE
        } as paramsRequest;
        console.log('============= >>>> getNovosLotes');

        return new Promise((resolve) => {
            this.campanhasLotesService
                .getAll(params)
                .subscribe({
                    next: async (response) => {
                        const aLote: Array<Lote> = [];
                        console.log('SyncDataService.getNovosLotes - response');
                        if (response.length) {
                            response.forEach(item => {
                                if (!item?.id) return;
                                aLote.push({
                                    id: item?.id,
                                    codigo: this.limparStringParaBancoDeDados(item?.loteCodigo),
                                } as unknown as Lote);
                            });

                            try {
                                console.log('SyncDataService.getNovosLotes - aLote', this.printJSON(aLote));
                                await this.bulkInsert('lote', aLote);
                                resolve({ total: aLote.length, hasConnection: true });
                            } catch (err) {
                                resolve({ total: 0, hasConnection: true });
                            }
                        } else {
                            resolve({ total: 0, hasConnection: true });
                        }
                    },
                    error: (err) => {
                        console.log('SyncDataService.getNovasUnidades - err', this.printJSON(err));
                        resolve({ total: 0, hasConnection: false });
                    }
                });
        });
    }
}
