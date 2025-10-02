import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Popover } from 'primeng/popover';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { Dashboard_Aula } from '../../../models/dashboard.model';
import { Evento } from '../../../models/evento.model';
import moment from 'moment';

@Component({
    selector: 'app-aluno-reposicao-tooltip',
    standalone: false,
    templateUrl: './aluno-reposicao-tooltip.component.html',
    styleUrl: './aluno-reposicao-tooltip.component.css'
})
export class AlunoReposicaoTooltipComponent implements OnChanges {
    @Input() evento?: Evento | Dashboard_Aula
    @Input() reposicaoDe?: Evento | Dashboard_Aula
    @Input() reposicaoPara?: Evento | Dashboard_Aula
    roteiroDe?: Roteiro;
    roteiroPara?: Roteiro;
    roteiro?: Roteiro;
    loading = false;

    @ViewChild('popover') popover!: Popover;
    roteiros: Roteiro[] = []

    constructor(
        private roteiroService: RoteiroService,
    ) {

        this.roteiroService.list.subscribe(res => this.roteiros = res)

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
        }
        if (changes['reposicaoDe']) {
            this.reposicaoDe = changes['reposicaoDe'].currentValue;
        }
        if (changes['reposicaoPara']) {
            this.reposicaoPara = changes['reposicaoPara'].currentValue;
        }
    }

    async loadRoteiro() {
        if (!this.roteiros.length) 
            this.roteiros = await lastValueFrom(this.roteiroService.getList(moment().year()))

        if (this.reposicaoDe) {
            if (this.reposicaoDe.roteiro_Id) {
                this.roteiroDe = this.roteiros.find(x => x.id == this.reposicaoDe?.roteiro_Id)
            } else {
                this.roteiroDe = this.roteiros.find(x => moment(this.reposicaoDe?.data).isBetween(x.dataInicio, x.dataFim, 'dates', '[]'));
            }
        }
        if (this.reposicaoPara) {
            if (this.reposicaoPara.roteiro_Id) {
                this.roteiroPara = this.roteiros.find(x => x.id == this.reposicaoPara?.roteiro_Id)
            } else {
                this.roteiroPara = this.roteiros.find(x => moment(this.reposicaoPara?.data).isBetween(x.dataInicio, x.dataFim, 'dates', '[]'));
            }
        }

        if (this.evento) {
            if (this.evento.roteiro_Id) {
                this.roteiro = this.roteiros.find(x => x.id == this.evento?.roteiro_Id)
            } else {
                this.roteiro = this.roteiros.find(x => moment(this.evento?.data).isBetween(x.dataInicio, x.dataFim, 'dates', '[]'));
            }
        }
    }

    show(e: any) {
        this.popover.show(e);

        this.loadRoteiro();
    }

    hide() {
        this.popover.hide();
    }


}
