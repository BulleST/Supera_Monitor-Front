import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { AlunoService } from '../../../services/alunos.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Popover } from 'primeng/popover';
import { CalendarioUtils, Crypto, MensagemWhatsapp } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { AlunoChecklistDialogComponent } from '../aluno-checklist-dialog/aluno-checklist-dialog.component';
import { SelectChangeEvent } from 'primeng/select';
import { Evento } from '../../../models/evento.model';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Aluno_Checklist_Item_View } from '../../../models/aluno-checklist-item-list.model';
import { AlunoChecklistOnConfirmDialogComponent } from '../aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
import { Aluno_CheckList_Item } from '../../../models/checklist.model';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'app-aluno-popover',
    standalone: false,
    templateUrl: './aluno-popover.component.html',
    styleUrl: './aluno-popover.component.css',
})
export class AlunoPopoverComponent implements OnChanges, OnDestroy {

    @Input() aluno_Id!: number;
    @Input() showChecklist: boolean = false;
    @Input() evento?: Evento;
    @Input() eventoReposicao?: Evento;
    @Input() participacao?: Evento_Participacao_Aluno;
    @Input() alunoChecklistItem?: Aluno_CheckList_Item | Aluno_Checklist_Item_View;
    @Input() aluno!: Aluno;

    checklistObservacao = '';
    subscription: Subscription[] = [];
    loadingAluno = false;
    loadingFoto = false;
    foto?: string;
    visible = false;

    @ViewChild('popover') popover!: Popover;
    @ViewChild('alunoChecklistDialog') alunoChecklistDialog!: AlunoChecklistDialogComponent;
    @ViewChild('alunoChecklistOnConfirmDialog') alunoChecklistOnConfirmDialog!: AlunoChecklistOnConfirmDialogComponent;

    menuOptionsValue: any;
    menuItems: MenuItem[] = [];

    constructor(
        private alunoService: AlunoService,
        private eventoService: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private crypto: Crypto,
        private activatedRoute: ActivatedRoute,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno_Id']) {
            this.aluno_Id = changes['aluno_Id'].currentValue;
        }
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
        }
        if (changes['eventoReposicao']) {
            this.eventoReposicao = changes['eventoReposicao'].currentValue;
        }
        if (changes['participacao']) {
            this.participacao = changes['participacao'].currentValue;
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
        return lastValueFrom(this.alunoService.get(this.aluno_Id))
            .then(res => {
                this.loadingAluno = false;
                this.aluno = res;

                this.loadMenuItems();
                this.loadAulaZero();
                this.loadPrimeiraAula();

                return this.aluno;
            })
            .catch(res => {
                this.loadingAluno = false;
                return undefined;
            });
    }

    loadFoto() {
        this.loadingFoto = true;
        lastValueFrom(this.alunoService.getFoto(this.aluno_Id))
            .then(res => {
                this.loadingFoto = false;
                this.foto = res;
                if (this.aluno)
                    this.aluno.aluno_Foto = res;
            })
            .catch(res => this.loadingFoto = false);
    }

    loadAulaZero() {
        if (this.aluno && this.aluno.aulaZero_Id) {
            lastValueFrom(this.eventoService.get(this.aluno.aulaZero_Id))
                .then(res => {
                    if (this.aluno)
                        this.aluno.aulaZero = res;
                })
        }
    }

    loadPrimeiraAula() {
        if (this.aluno && this.aluno.primeiraAula_Id) {
            lastValueFrom(this.eventoService.get(this.aluno.primeiraAula_Id))
                .then(res => {
                    if (this.aluno)
                        this.aluno.primeiraAula = res;
                })
        }
    }

    loadMenuItems() {
        this.menuItems = [];

        // Editar aluno
        this.menuItems.push({
            label: 'Ver aluno',
            icon: 'pi pi-user-edit text-primary-500 ',
            styleClass: 'text-primary-500 bg-primary-50 hover:bg-primary-100',
            command: () => this.goToAluno(),
        })

        let nome = this.participacao?.aluno ?? this.aluno?.nome ?? '';
        let celular = this.participacao?.celular ?? this.aluno?.celular ?? '';

        // Enviar mensagem
        this.menuItems.push({
            label: 'Enviar mensagem',
            icon: 'pi pi-whatsapp text-green-500',
            styleClass:  celular ? 'text-green-500 bg-green-50 hover:bg-green-100' :  'text-500 surface-50',
            disabled: !celular,
            command: () => {
                let object = this.mensagemWhatsapp.enviarMensagem(nome, celular);
                window.open(object.link, '_blank');
                this.mensagemWhatsapp.copiarMensagem(object.mensagem);
            },
        })
        // Jornada Supera
        if (this.showChecklist) {
            this.menuItems.push({
                label: 'Jornada Supera',
                icon: 'pi pi-check-square text-500',
                styleClass: 'text-500 surface-50 hover:surface-100',
                command: async () => {
                    this.alunoChecklistDialog.show(this.aluno);
                },
            })
        }

        // Agendar reposição
        if (this.eventoReposicao
            && this.participacao
            && (this.participacao.presente != true)) {
            this.menuItems.push({
                label: 'Agendar reposição',
                icon: 'pi pi-calendar text-500',
                styleClass: 'text-500 surface-50 hover:surface-100',
                disabled: !this.aluno.active,
                command: () => {
                    this.goToAgendarReposicao();
                },
            })
        }

        // Agendar falta
        this.menuItems.push({
            label: 'Agendar falta',
            icon: 'fas fa-thumbs-down text-red-500',
            styleClass: this.aluno.active ? 'text-red-500 surface-50 hover:surface-100' : '',
            disabled: !this.aluno.active 
                    || this.participacao?.presente === false 
                    || this.evento?.finalizado,
            command: (e: MenuItemCommandEvent) => {
                this.goToAgendarFalta(e)
            },
        })

        // Finalizar checklist
        if (this.alunoChecklistItem && !this.alunoChecklistItem.finalizado) {
            this.menuItems.push({
                label: 'Finalizar checklist',
                icon: 'pi pi-check text-primary-500',
                styleClass: 'text-primary-500 bg-primary-100 hover:bg-primary-200',
                disabled: !this.aluno.active,
                command: () => {
                    let checklist = this.alunoChecklistItem as Aluno_CheckList_Item
                    this.alunoChecklistOnConfirmDialog.show(this.aluno, checklist);
                },
            })
        }
    }

    menuItemChanged(e: SelectChangeEvent, select: NgModel) {
        if (e.value && e.value.command) {
            e.value.command(e);
            select.control.setValue(undefined)
            select.control.updateValueAndValidity();
        }
    }

    show(e: any, aluno?: Aluno) {
        this.visible = true;
        this.popover.show(e);

        console.log('show')
        console.log('aluno', this.aluno)
        console.log('participacao', this.participacao)
        
        if (aluno) {
            this.aluno = aluno
        } 
        else {
            this.loadAluno();
        }
        this.loadFoto();
    }

    toggle(e: any, aluno?: Aluno) {
        this.visible = !this.visible;
        this.popover.toggle(e);
        console.log('toggle')
        console.log('aluno', this.aluno)
        console.log('participacao', this.participacao)
        if (this.popover.overlayVisible) {
            if (aluno) {
                this.aluno = aluno
            } 
            else {
                this.loadAluno();
            }
            this.loadFoto();
        }
    }

    hide() {
        this.visible = false;
        this.popover.hide();
    }

    goToAluno() {
        if (this.aluno_Id) {
            this.router.navigate(['alunos', 'editar', this.crypto.encrypt(this.aluno_Id)])
        }
    }

    goToAgendarReposicao() {
        this.eventoService.setEventoReposicaoDe(this.evento);
        this.eventoService.setEventoReposicaoPara(undefined);
        this.router.navigate(['reposicao', 'agendar', this.crypto.encrypt(this.aluno_Id)], { relativeTo: this.activatedRoute });
    }

    alunoChanged(aluno: Aluno) {
        this.aluno = aluno;
        if (this.alunoChecklistDialog) {
            this.alunoChecklistDialog.aluno = aluno;
        }
    }

    padStartPage(numero: number | undefined, length: number, fill: string) {
        if (numero) {
            return numero.toString().padStart(length, fill);
        }
        else {
            return '0'.padStart(length, fill);
        }
    }

    goToAgendarFalta(e: MenuItemCommandEvent) {
        this.eventoService.setEvento(this.evento);
        this.alunoService.setAluno(this.aluno);
        this.router.navigate(['agendar-falta', this.crypto.encrypt(this.aluno_Id)], { relativeTo: this.activatedRoute });
    }

}
