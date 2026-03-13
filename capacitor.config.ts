import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.vacinar.vms',
  appName: 'vms-app',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    cleartext: true,
    allowNavigation: [
      "localhost:8100/*",
      "http://191.252.178.7:8012/*",
    ]
  }
};

export default config;
