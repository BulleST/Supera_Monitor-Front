import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { Checklist_Item } from '../../../models/checklist.model';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Evento } from '../../../models/evento.model';
import { Crypto } from '../../../utils';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../services/evento.service';
import moment from 'moment';

@Component({
    selector: 'app-selected-aluno',
    standalone: false,
    templateUrl: './selected-aluno.component.html',
    styleUrl: './selected-aluno.component.css',
})
export class _SelectedAlunoComponent implements OnChanges, OnDestroy {
    visible = false;
    itemChecklists: Checklist_Item[] = [];
    subscription: Subscription[] = [];

    @Input() aluno?: Evento_Participacao_Aluno;
    @Input() evento: Evento = new Evento;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: EventoService,
        private confirmationService: ConfirmationService,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
        this.visible = true;


    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedAula']) {
            this.evento = changes['selectedAula'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }

        if (this.aluno && this.evento) {
            this.visible = true;
        }
    }

    hide() {
        if (!this.visible) {
            this.aluno = undefined;
            this.visible = false
        }
    }

    goToAluno(aluno: Evento_Participacao_Aluno) {
        console.log('goToAluno', aluno)
        this.service.setEvento(this.evento);
        this.router.navigate(['calendario', 'aluno', this.crypto.encrypt(aluno.aluno_Id)]);    
    }

    goToReposicao(aluno: Evento_Participacao_Aluno) {
        this.service.setEvento(this.evento);
        this.router.navigate(['calendario', 'aluno', 'reposicao', this.crypto.encrypt(aluno.aluno_Id)]);
    }


    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular);
    }

    showError(title: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: title,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    primeiraAula(aluno: Evento_Participacao_Aluno, evento:Evento) {
        return moment(aluno.primeiraAula).isSame(evento.data)
    }

}
