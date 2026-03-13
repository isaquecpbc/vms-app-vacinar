import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'application',
    loadChildren: () => import('./application/application.module').then( m => m.ApplicationPageModule)
  },
  {
    path: 'downloadfromhttp',
    loadChildren: () => import('./downloadfromhttp/downloadfromhttp.module')
      .then(m => m.DownloadFromHTTPModule)
  },
  {
    path: 'importjson',
    loadChildren: () => import('./testimportjson/testimportjson.module')
      .then(m => m.TestimportjsonPageModule)
  },
  {
    path: 'configuration',
    loadChildren: () => import('./configuration/configuration.module').then( m => m.ConfigurationPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'application-place',
    loadChildren: () => import('./application-place/application-place.module').then( m => m.ApplicationPlacePageModule)
  },
  {
    path: 'test2dbs',
    loadChildren: () => import('./test2dbs/test2dbs.module').then( m => m.Test2dbsPageModule)
  },
  // {
  //   path: 'network-sync',
  //   loadChildren: () => import('./network-sync/network-sync.module').then( m => m.NetworkSyncPageModule)
  // },
  {
    path: 'logout',
    loadChildren: () => import('./logout/logout.module').then( m => m.LogoutPageModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then( m => m.ReportsPageModule)
  },
  {
    path: 'application-zipcode',
    loadChildren: () => import('./application-zipcode/application-zipcode.module').then( m => m.ApplicationZipcodePageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
