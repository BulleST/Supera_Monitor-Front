import { Component, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Aula, Dashboard_Aula_Participacao } from '../../../../models/dashboard.model';
import { Popover } from 'primeng/popover';
import { Router } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../utils';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../../services/evento.service';
import moment from 'moment';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { Aluno } from '../../../../models/alunos.model';
@Component({
    selector: 'app-aula-participacao-popover',
    standalone: false,
    templateUrl: './aula-participacao-popover.component.html',
    styleUrl: './aula-participacao-popover.component.css'
})
export class AulaParticipacaoPopoverComponent implements OnChanges {
    @Input() item!: Dashboard_Aula_Participacao;
    @Input() aluno!: Dashboard_Aluno;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private router: Router,
        private crypto: Crypto,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) this.item = changes['item'].currentValue;
        if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
    }

    show(e: any) {
        this.popover.show(e);
        try {
            this.popover.align();
        }
        catch (e) {

        }
    }

    hide() {
        this.popover.hide();
    }

    onHide() {

    }

    goToReposicao(aluno_Id: number, evento_Id: number) {
        lastValueFrom(this.service.get(evento_Id))
            .then(evento => {
                this.service.setEventoReposicaoDe(evento);
                this.router.navigate(['dashboard', 'reposicao', 'agendar', this.crypto.encrypt(aluno_Id)])
            })
    }


    enviarMensagemFalta(item: Dashboard_Aula_Participacao, aluno: Dashboard_Aluno, e: any) {
        let participacao: Evento_Participacao_Aluno = {
            id: item.participacao.id,
            aluno_Id: aluno.id,
            aluno: aluno.nome,
            celular: aluno.celular,
            perfilCognitivo_Id: aluno.perfilCognitivo_Id,
            presente: item.participacao.presente,
        } as any;
        let evento: Evento = {
            data: item.aula.data,
            evento_Tipo_Id: item.aula.evento_Tipo_Id,
            descricao: item.aula.descricao,
        } as any;
        this.mensagemWhatsapp.enviarMensagemFalta(evento, participacao, e);
    }





    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent): void {

        this.hide();
    }
}
