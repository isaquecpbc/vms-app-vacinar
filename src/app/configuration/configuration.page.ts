import { Component, OnInit } from '@angular/core';
import { AplicacoesService } from '../services/aplicacoes.service';
import { Http, HttpOptions } from '@capacitor-community/http';
import { forkJoin, from, map } from 'rxjs';
import { HttpResponse } from "@capacitor/core";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
})
export class ConfigurationPage implements OnInit {

  public progress:string = '0';
  public workOffline: boolean = false;
  public totalImportado: number = 0;
  public totalRowsTable: number = 0;

  constructor(
    private aplicacaoService: AplicacoesService,
  ) { }

  ngOnInit() {
    this.aplicacaoService.totalRowsTable.subscribe(
      item => this.totalRowsTable = item
    );
    this.aplicacaoService.totalImportaded.subscribe(
      item => {
        this.totalImportado += item;
        this.updateProgress();
      }
    )
  }

  updateProgress() {
    this.progress = this.totalRowsTable ? parseFloat(`${this.totalImportado/this.totalRowsTable}`).toFixed(2) : '0';
  }

  changeOffline(ev: any) {
    if (ev.detail.checked) {
      this.aplicacaoService.salvarOffline();
    }
  }

}
