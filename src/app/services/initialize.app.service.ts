
import { SQLiteService } from './sqlite.service';

import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MigrationService } from './migrations.service';


@Injectable()
export class InitializeAppService {

  constructor(
    private sqliteService: SQLiteService,
    private migrationService: MigrationService,
    private platform: Platform
  ) { }

  async initializeApp() {
    await this.platform.ready();
    await this.sqliteService.initializePlugin().then(async (ret) => {
      try {
        //execute startup queries
        await this.migrationService.migrate();

      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw Error(`initializeAppError: ${errorMessage}`);
      }

    });
  }

}
