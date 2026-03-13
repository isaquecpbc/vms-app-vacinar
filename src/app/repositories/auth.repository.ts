import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SQLiteService } from '../services/sqlite.service';
import { Auth } from '../models/auth.model';

@Injectable()
export class AuthRepository {

  constructor(private _sqlite: SQLiteService) { }

  /** Abre conexão com o banco correto (environment.DB_NAME),
   * reaproveitando conexão existente se houver. */
  private async getConnection() {
    const isConnection = await this._sqlite.checkConnectionsConsistency();
    if (isConnection.result) {
      return this._sqlite.retrieveConnection(environment.DB_NAME);
    }
    const db = await this._sqlite.createConnection(environment.DB_NAME, false, 'no-encryption', 1);
    if (db == null) throw new Error('AuthRepository: falha ao criar conexão com o banco');
    await db.open();
    return db;
  }

  async getAll(): Promise<Auth[]> {
    try {
      const db = await this.getConnection();
      const result = await db.query('SELECT * FROM auth');
      await this._sqlite.closeConnection(environment.DB_NAME);
      return (result.values ?? []) as Auth[];
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getById(login: string): Promise<Auth> {
    try {
      const db = await this.getConnection();
      const result = await db.query('SELECT * FROM auth WHERE login = ? LIMIT 1', [login]);
      console.log('[AuthRepository] getById result:', JSON.stringify(result));
      await this._sqlite.closeConnection(environment.DB_NAME);
      if (result.values && result.values.length > 0) {
        return result.values[0] as Auth;
      }
      throw new Error(`AuthRepository: usuário '${login}' não encontrado`);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async create(auth: Auth): Promise<Auth> {
    try {
      const db = await this.getConnection();
      const sqlcmd = 'INSERT OR REPLACE INTO auth (login, nome, token, password) VALUES (?, ?, ?, ?)';
      const values = [auth.login, auth.nome, auth.token ?? '', auth.password ?? ''];
      console.log('[AuthRepository] create:', sqlcmd, values);
      const ret: any = await db.run(sqlcmd, values);
      await this._sqlite.closeConnection(environment.DB_NAME);
      if (ret.changes.lastId > 0) {
        return ret.changes as Auth;
      }
      throw new Error('AuthRepository: falha ao criar registro auth');
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async deleteById(login: string): Promise<void> {
    try {
      const db = await this.getConnection();
      await db.query('DELETE FROM auth WHERE login = ?', [login]);
      await this._sqlite.closeConnection(environment.DB_NAME);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getConnection();
      await db.execute('DELETE FROM auth;', false);
      await this._sqlite.closeConnection(environment.DB_NAME);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
