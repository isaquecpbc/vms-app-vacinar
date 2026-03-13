import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DatabaseService } from './database.service';
import { SQLiteService } from './sqlite.service';

export const createSchemaLocalStorage: string = `
CREATE TABLE IF NOT EXISTS localStorage (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const createSchemaStoredRequest: string = `
CREATE TABLE IF NOT EXISTS storedRequest (
  id VARCHAR PRIMARY KEY,
  url VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  data TEXT,
  time BIGINT,
  completed CHARACTER,
  response TEXT,
  header VARCHAR
);
`;

export const createSchemaClinica: string = `
CREATE TABLE IF NOT EXISTS clinica (
  id INTEGER PRIMARY KEY NOT NULL,
  razao TEXT NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const createSchemaAuth: string = `
CREATE TABLE IF NOT EXISTS auth (
  login TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  token TEXT NOT NULL,
  password TEXT DEFAULT '',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const createSchemaAplicacao: string = `
CREATE TABLE IF NOT EXISTS aplicacao (
  id INTEGER PRIMARY KEY NOT NULL,
  participanteNome TEXT NOT NULL,
  dtAplicacao TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const createSchemaProducts: string = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMBER NOT NULL,
  imageUrl TEXT DEFAULT '',
  isAvailable BOOLEAN NOT NULL CHECK (isAvailable IN (0, 1)),
  isPopular BOOLEAN NOT NULL CHECK (isAvailable IN (0, 1)),
  category TEXT DEFAULT '',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export const createSchemaTest: string = `
CREATE TABLE IF NOT EXISTS test (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);
`;

@Injectable()
export class MigrationService {

  constructor(private sqliteService: SQLiteService, private databaseService: DatabaseService) {
  }

  async migrate(): Promise<any> {
    // await this.createTestTable();
    // await this.createProductsTable();
    await this.createClinicaTable();
    await this.createStoredRequestTable();
    await this.createAplicacaoTable();
    await this.createAuthTable();
    await this.ensureAuthPasswordColumn();
    await this.createLocalStorageTable();
  }

  // async createProductsTable(): Promise<any> {
  //   await this.databaseService.executeQuery(async (db) => {
  //     await db.execute(createSchemaProducts);
  //   });
  // }
  async createStoredRequestTable(): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(createSchemaStoredRequest);
    });
  }

  async createClinicaTable(): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(createSchemaClinica);
    });
  }

  async createAplicacaoTable(): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(createSchemaAplicacao);
    });
  }

  async createLocalStorageTable(): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(createSchemaLocalStorage);
    });
  }

  async createAuthTable(): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(createSchemaAuth);
    });
  }

  async ensureAuthPasswordColumn(): Promise<void> {
    await this.databaseService.executeQuery(async (db) => {
      try {
        await db.execute("ALTER TABLE auth ADD COLUMN password TEXT DEFAULT '';");
      } catch (error: any) {
        const message = error?.message || String(error);
        if (!message.toLowerCase().includes('duplicate column')) {
          throw error;
        }
      }
    });
  }

  // async createTestTable(): Promise<void> {
  //   console.log(`going to create a connection`)
  //   const db = await this.sqliteService.createConnection(environment.databaseName, false, "no-encryption", 1);
  //   console.log(`db ${JSON.stringify(db)}`)
  //   await db.open();
  //   console.log(`after db.open`)
  //   let query = createSchemaTest;
  //   console.log(`query ${query}`)

  //   const res: any = await db.execute(query);
  //   console.log(`res: ${JSON.stringify(res)}`)
  //   await this.sqliteService.closeConnection(environment.databaseName);
  //   console.log(`after closeConnection`)
  // }
}
