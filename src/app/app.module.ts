import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localePt);

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ComponentsModule } from './components/components.module';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
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
import { LocalStorageRepository } from './repositories/localstorage.repository';
import { CampanhasClinicasRepository } from './repositories/campanhas-clinicas.repository';
import { AplicacoesRepository } from './repositories/aplicacoes.repository';
import { ApiManagerService } from './services/api-manager.service';
import { StoredRequestRepository } from './repositories/stored-request.repository';
import { DEFAULT_TIMEOUT, TimeoutInterceptor } from './services/timeout.interceptor';
import { JwtInterceptor } from './interceptors/http-request.interceptor';

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
      name: 'vms-app-2',
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
    LocalStorageRepository,
    CampanhasClinicasRepository,
    StoredRequestRepository,
    AplicacoesRepository,
    ApiManagerService,
    InitializeAppService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [InitializeAppService],
      multi: true
    },
    {
      provide: LOCALE_ID, useValue: 'pt-BR'
    },
    [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: 30000 }],
    [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }]
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
