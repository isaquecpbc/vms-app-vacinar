import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ComponentsModule } from './components/components.module';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { SQLiteService } from './services/sqlite.service';
import { DatabaseService } from './services/database.service';
import { DetailService } from './services/detail.service';
import { MigrationService } from './services/migrations.service';
import { InitializeAppService } from './services/initialize.app.service';
import { ProductRepository } from './application/repositories/product.repository';
import { AuthRepository } from './repositories/auth.repository';

export function initializeFactory(init: InitializeAppService) {
  return () => init.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ComponentsModule,
    IonicStorageModule.forRoot({
      name: 'vms-app',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NativeStorage,
    SQLiteService,
    DetailService,
    MigrationService,
    DatabaseService,
    ProductRepository,
    AuthRepository,

    InitializeAppService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [InitializeAppService],
      multi: true
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
