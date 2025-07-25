import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { EventoService } from '../../../services/evento.service';
import { lastValueFrom } from 'rxjs';
import { Popover } from 'primeng/popover';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';

@Component({
    selector: 'app-aluno-reposicao-tooltip',
    standalone: false,
    templateUrl: './aluno-reposicao-tooltip.component.html',
    styleUrl: './aluno-reposicao-tooltip.component.css'
})
export class AlunoReposicaoTooltipComponent implements OnChanges {
    @Input() participacao!: Evento_Participacao_Aluno;
    roteiro!: Roteiro;
    loading = false;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private service: EventoService,
        private roteiroService: RoteiroService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['participacao']) {
            this.participacao = changes['participacao'].currentValue;
            this.loadReposicaoDe();
        }
    }

    loadReposicaoDe() {
        if (this.participacao.reposicaoDe_Evento_Id && !this.participacao.reposicaoDe_Evento) {
            this.loading = true;
            lastValueFrom(this.service.get(this.participacao.reposicaoDe_Evento_Id))
            .then(res => {
                this.participacao.reposicaoDe_Evento = res;
                this.loading = false;
            })
        }
    }

    loadRoteiro() {
        if (this.participacao.reposicaoDe_Evento && !this.roteiro) {
            lastValueFrom(this.roteiroService.get(this.participacao!.reposicaoDe_Evento!.roteiro_Id!))
            .then(res => {
                this.roteiro = res;
            })
        }
    }


    show(e: any, participacao: Evento_Participacao_Aluno) {
        this.participacao = participacao;
        this.loadReposicaoDe();
        this.popover.show(e);
    }

    hide() {
        this.popover.hide();
    }


}
