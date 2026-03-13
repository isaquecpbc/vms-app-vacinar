// ARQUIVO TEMPORÁRIO PARA TESTE - PODE SER DELETADO DEPOIS
// Este arquivo ajuda a popular dados fake para testar a aplicação

import { SQLiteService } from './services/sqlite.service';
import { environment } from 'src/environments/environment';

export class TestDataHelper {

    constructor(private sqlite: SQLiteService) { }

    /**
     * Popula dados fake no localStorage para permitir acesso à tela de aplicação
     * Para desfazer: execute clearTestData() ou delete este arquivo e remova as chamadas
     */
    async populateFakeData(): Promise<void> {
        try {
            const db = await this.sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
            if (db == null) throw new Error("Falha ao criar conexão com banco");
            await db.open();

            // Dados fake da clínica
            const fakeClinica = {
                id: 999,
                razao: 'Clínica Teste VMS',
                fantasia: 'Teste VMS',
                cnpj: '00.000.000/0000-00'
            };

            // Dados fake do profissional
            const fakeProfissional = {
                id: 999,
                nome: 'Dr. João Silva',
                registro: 'CRM-12345',
                tipo: 'Enfermeiro'
            };

            // Dados fake do lote
            const fakeLote = {
                id: 999,
                codigo: 'LOTE-TEST-2026',
                produto: 'Vacina Teste',
                validade: '2026-12-31'
            };

            // ID fake da unidade
            const fakeUnidadeId = 999;

            // Inserir no localStorage
            const sqlcmd = "INSERT or REPLACE into localStorage (key, value) values (?, ?)";

            await db.run(sqlcmd, ['clinica', JSON.stringify(fakeClinica)]);
            await db.run(sqlcmd, ['profissional', JSON.stringify(fakeProfissional)]);
            await db.run(sqlcmd, ['lote', JSON.stringify(fakeLote)]);
            await db.run(sqlcmd, ['unidade', JSON.stringify(fakeUnidadeId)]);

            await this.sqlite.closeConnection(environment.DB_NAME);

            console.log('✅ Dados fake populados com sucesso!');
            console.log('Clínica:', fakeClinica);
            console.log('Profissional:', fakeProfissional);
            console.log('Lote:', fakeLote);
            console.log('Unidade ID:', fakeUnidadeId);
        } catch (err) {
            console.error('❌ Erro ao popular dados fake:', err);
            throw err;
        }
    }

    /**
     * Remove os dados fake do localStorage
     */
    async clearTestData(): Promise<void> {
        try {
            const db = await this.sqlite.createConnection(environment.DB_NAME, false, "no-encryption", 1);
            if (db == null) throw new Error("Falha ao criar conexão com banco");
            await db.open();

            const sqlcmd = "DELETE FROM localStorage WHERE key IN (?, ?, ?, ?)";
            await db.run(sqlcmd, ['clinica', 'profissional', 'lote', 'unidade']);

            await this.sqlite.closeConnection(environment.DB_NAME);

            console.log('✅ Dados fake removidos com sucesso!');
        } catch (err) {
            console.error('❌ Erro ao remover dados fake:', err);
            throw err;
        }
    }
}
