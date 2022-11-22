import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Aplicar', url: '/application', icon: 'eyedrop' },
    { title: 'Configurações', url: '/configuration', icon: 'construct' },
    { title: 'Relatórios', url: '/folder/Inbox', icon: 'document-text' },
    { title: 'Sair', url: '/folder/Inbox', icon: 'log-out' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor() {}
}
