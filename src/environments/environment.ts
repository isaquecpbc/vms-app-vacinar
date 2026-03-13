// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  KEY_ENCRYPT: '123456',
  databaseName: 'vms-teste',
  DB_URI: 'http://sgcsaude.net.br/vms-app-full.zip',
  DB_URI_PARTIAL: 'http://sgcsaude.net.br/partial-import.json',
  DB_NAME: 'vms-app-full',
  CAMPANHA_OFFLINE: 247,
  versionAPP: 60,
  apiUrl: 'https://sgc.vacinar.com.br',
  // apiUrl: 'http://191.252.178.7:8012'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
