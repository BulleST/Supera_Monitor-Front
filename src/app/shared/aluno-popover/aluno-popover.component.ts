import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { AlunoService } from '../../services/alunos.service';
import { ChecklistService } from '../../services/checklist.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../models/alunos.model';
import { Popover } from 'primeng/popover';
import { Crypto, MensagemWhatsapp } from '../../utils';
import { Router } from '@angular/router';
import { EventoService } from '../../services/evento.service';
import { MenuItem } from 'primeng/api';
import { AlunoChecklistDialogComponent } from '../aluno-checklist-dialog/aluno-checklist-dialog.component';
import { SelectChangeEvent } from 'primeng/select';

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
    @ViewChild('alunoChecklistDialog') alunoChecklistDialog!: AlunoChecklistDialogComponent;


    menuItems: MenuItem[] = []

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

                this.loadMenuItems();
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

    loadMenuItems() {
        this.menuItems = [];

        this.menuItems.push({
            label: 'Editar aluno',
            icon: 'pi pi-user-edit text-primary-500 ',
            styleClass: 'text-primary-500 bg-primary-50 hover:bg-primary-100',
            command: () => this.goToAluno(),
        })
        this.menuItems.push({
            label: 'Enviar mensagem',
            icon: 'pi pi-whatsapp text-green-500',
            styleClass: 'text-green-500 bg-green-50 hover:bg-green-100',
            disabled: !this.aluno.celular,
            command: () => {
                window.open(this.enviarMensagem(), '_blank');
            },
        })
        if (this.showChecklist) {
            this.menuItems.push({
                label: 'Jornada Supera',
                icon: 'pi pi-check-square text-500',
                styleClass: 'text-500 surface-50 hover:surface-100',
                command: () => {
                    this.alunoChecklistDialog.show();
                },
            })
        }
    }

        
    menuItemChanged(e: SelectChangeEvent) {
        if (e.value.command)
            e.value.command(e);
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
