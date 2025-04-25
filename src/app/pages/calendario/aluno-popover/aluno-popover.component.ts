import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Popover } from 'primeng/popover';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { Crypto } from '../../../utils';

@Component({
    selector: 'app-aluno-popover',
    templateUrl: './aluno-popover.component.html',
    styleUrl: './aluno-popover.component.css',
    standalone: false,
})
export class AlunoPopoverComponent implements OnChanges {
    @Input() aluno: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
    @Input() evento: Evento = new Evento;
    @Input() showChecklist = false
    loading = false;
    EventoTipo = EventoTipo;

    @ViewChild('popover') popover!: Popover

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: EventoService,
    ) {

    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
        }
        if (changes['showChecklist']) {
            this.showChecklist = changes['showChecklist'].currentValue;
        }
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    toggle(e: any) {
        this.popover.toggle(e)
    }

    show(e: any) {
        this.popover.show(e)
    }

    hide() {
        this.popover.hide();
    }
    
    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }
    
    goToAluno(aluno: Evento_Participacao_Aluno) {
        // this.service.setEvento(this.evento);
        var encrypted = this.crypto.encrypt(aluno.aluno_Id)
        // this.router.navigate([ 'aluno', encrypted], { relativeTo: this.activatedRoute })
        return ['aluno', encrypted];
    }

    goToReposicao(aluno: Evento_Participacao_Aluno) {
        this.service.setEvento(this.evento);
        this.router.navigate(['calendario', 'aluno', 'reposicao', this.crypto.encrypt(aluno.aluno_Id)]);
    }


}
