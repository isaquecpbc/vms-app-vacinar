import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-success-modal',
    templateUrl: './success-modal.component.html',
    styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent implements OnInit {
    @Input() participanteNome: string = '';
    @Input() mensagem: string = 'A aplicação foi realizada com sucesso!';
    @Input() lote: string = '';
    @Input() profissional: string = '';

    dataHora: Date = new Date();

    constructor(private modalController: ModalController) { }

    ngOnInit() { }

    dismiss() {
        this.modalController.dismiss();
    }

    formatCpf(cpf?: string): string {
        if (!cpf) return '';
        const onlyNums = cpf.replace(/\D+/g, '');
        return onlyNums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}
