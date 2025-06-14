import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { AlunoService } from '../../services/alunos.service';
import { ChecklistService } from '../../services/checklist.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../models/alunos.model';
import { Aluno_CheckList_Item, Checklist } from '../../models/checklist.model';
import { Popover } from 'primeng/popover';
import { Crypto, MensagemWhatsapp } from '../../utils';
import { Router } from '@angular/router';
import { EventoService } from '../../services/evento.service';

@Component({
    selector: 'app-aluno-popover',
    standalone: false,
    templateUrl: './aluno-popover.component.html',
    styleUrl: './aluno-popover.component.css',
})
export class AlunoPopoverComponent implements OnChanges, OnDestroy {

    @Input() aluno_Id!: number;
    @Input() showChecklist: boolean = false;

    subscription: Subscription[] = [];
    aluno!: Aluno;
    loadingAluno = false;
    // alunos: Aluno[] = [];

    loadingFoto = false;
    foto?: string;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private alunoService: AlunoService,
        private eventoService: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private crypto: Crypto,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        
        if (changes['aluno_Id']) {
            this.aluno_Id = changes['aluno_Id'].currentValue;
        }
        if (changes['showChecklist']) {
            this.showChecklist = changes['showChecklist'].currentValue;
        }
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadAluno() {
        this.loadingAluno = true;
        lastValueFrom(this.alunoService.get(this.aluno_Id))
            .then(res => {
                this.loadingAluno = false;
                this.aluno = res;

                this.loadAulaZero();
                this.loadPrimeiraAula();
            })
            .catch(res => this.loadingAluno = false);
    }

    loadFoto() {
        this.loadingFoto = true;
        lastValueFrom(this.alunoService.getFoto(this.aluno_Id))
            .then(res => {
                this.loadingFoto = false;
                this.aluno.aluno_Foto = res;
                this.foto = res;
            })
            .catch(res => this.loadingFoto = false);
    }

    loadAulaZero() {
        if (this.aluno && this.aluno.aulaZero_Id) {
            lastValueFrom(this.eventoService.get(this.aluno.aulaZero_Id))
            .then(res => {
                this.aluno.aulaZero = res;
            })
        }
    }

    loadPrimeiraAula() {
        if (this.aluno && this.aluno.primeiraAula_Id) {
            lastValueFrom(this.eventoService.get(this.aluno.primeiraAula_Id))
            .then(res => {
                this.aluno.primeiraAula = res;
            })
        }
    }

    show(e: any) {
        this.popover.show(e);

        this.loadAluno();
        this.loadFoto();
    }

    toggle(e: any) {
        this.popover.toggle(e);
        if (this.popover.overlayVisible) {
            this.loadAluno();
            this.loadFoto();
        }
    }

    hide() {
        this.popover.hide();
    }

    goToAluno() {
        if (this.aluno_Id) {
            this.router.navigate(['alunos', 'editar', this.crypto.encrypt(this.aluno_Id)])
        }
    }

    enviarMensagem() {
        if (this.aluno && this.aluno.celular) {
            return this.mensagemWhatsapp.enviarMensagem(this.aluno.nome, this.aluno.celular)
        }
        return;
    }
}
