import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Aluno_CheckList_Item, Checklist } from '../../../models/checklist.model';
import { CalendarioAlunoChecklistView } from '../../../models/calendario.model';
import { NgModel } from '@angular/forms';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { ChecklistService } from '../../../services/checklist.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { Popover } from 'primeng/popover';
import { Tabs } from 'primeng/tabs';
import $ from 'jquery';
import { playAlert, playSuccess } from '../../../utils/audio';
import { showError } from '../../../utils';

@Component({
    selector: 'app-aluno-checklist',
    standalone: false,
    templateUrl: './aluno-checklist.component.html',
    styleUrl: './aluno-checklist.component.css',
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlunoChecklistComponent implements OnChanges, OnDestroy, AfterViewInit {
    @Input() aluno: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
    loading: boolean = false;
    checklists: Checklist[] = [];
    subscription: Subscription[] = [];

    @ViewChild('popover') popover!: Popover
    @ViewChild('tabs') tabs!: Tabs;
    @ViewChildren('tab') tab!: QueryList<Tabs>;

    textoChecklist = '';
    checklist?: CalendarioAlunoChecklistView;
    atrasado = false;

    checklistIndex: number = 0;
    scrollLeft: number = 0;

    constructor(
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private service: ChecklistService,
        private userService: UserService,
        private checklistService: ChecklistService
    ) {
        var checklist = this.service.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklist);

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;

            if (   !this.aluno.alunoChecklist 
                || !this.aluno.alunoChecklist.length 
                || !this.aluno.checklistCompleto 
                || !this.aluno.checklistCompleto.length) {
                await this.loadChecklistAluno();
                this.setChecklist()
            } else {
                this.setChecklist()
            }



        }
    }
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async loadChecklistAluno() {
        this.loading = true;

        if (this.checklists.length == 0) {
            await lastValueFrom(this.service.getList())
        }

        await lastValueFrom(this.service.getChecklistAluno(this.aluno.aluno_Id))
            .then(res => {
                this.aluno.alunoChecklist = res.filter(x => x.aluno_Id == this.aluno.aluno_Id)
                    .map(checklistAluno => {
                        checklistAluno.finalizado = !!checklistAluno.dataFinalizacao;
                        return checklistAluno
                    });
                this.aluno.checklistCompleto = this.checklists
                    .map(checklist => {
                        var checklistAluno = new CalendarioAlunoChecklistView;
                        checklistAluno.id = checklist.id;
                        checklistAluno.nome = checklist.nome;
                        checklistAluno.items = res.filter(x => x.checklist_Id == checklist.id);
                        checklistAluno.prazo = checklistAluno.items[0]?.prazo ?? undefined;
                        checklistAluno.finalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                        checklistAluno.atrasados = checklistAluno.items.filter((x: any) => !x.finalizado && moment(x.prazo).week() < moment(new Date).week());
                        checklistAluno.pendentesDaSemana = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                        return checklistAluno;
                    });
                this.loading = false;
            })
    }

    setChecklist() {
        
            if (this.aluno.checklist_Id) {
                this.checklist = this.aluno.checklistCompleto.find(x => x.id == this.aluno.checklist_Id) as CalendarioAlunoChecklistView;
                this.checklistIndex = this.aluno.checklist_Id;
            }
            else if (!this.aluno.checklist_Id && this.aluno.checklistCompleto && this.aluno.checklistCompleto.length > 0) {
                
                this.checklist = this.aluno.checklistCompleto[this.aluno.checklistCompleto.length - 1]
                this.checklistIndex = this.checklist.id;
                
                var pendentesDaSemana = this.aluno.checklistCompleto.filter(x => x.pendentesDaSemana.length)
                var atrasados = this.aluno.checklistCompleto.filter(x => x.atrasados.length > 0);
                this.atrasado = atrasados.length > 0;
                if (atrasados.length > 0) this.textoChecklist = '90 dias encerrados com itens em atraso';
                if (atrasados.length == 0 && pendentesDaSemana.length == 0) this.textoChecklist = '90 dias concluídos';
            }

    }


    checkboxChange(item: Aluno_CheckList_Item, checklist: CalendarioAlunoChecklistView, model: NgModel, e: any) {
        if (model.control.value) {
            if (moment(item.prazo).week() > moment(new Date).week()) {
                this.showError('Checklist indisponível', 'Você não pode finalizar esse checklist ainda.', e);
                model.control.setValue(false);
                return;
            }

            playAlert();

            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                acceptButtonStyleClass: 'p-button-rounded  px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                rejectButtonStyleClass: 'p-button-rounded p-button-text',
                accept: async () => {
                    this.loading = true;
                    lastValueFrom(this.service.markAsDone(item.id))
                        .then(res => {
                            playSuccess();
                            this.loading = false;
                            this.toastrService.success(`Checklist ${item.nome} finalizado com sucesso!`);
                            item.finalizado = true;
                            item.dataFinalizacao = res.object.dataFinalizacao;
                            item.account_Finalizacao_Id = res.object.account_Finalizacao_Id;

                            checklist.prazo = checklist.items[0].prazo;
                            checklist.finalizados = checklist.items.filter((x: any) => x.finalizado)
                            checklist.atrasados = checklist.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                            checklist.pendentesDaSemana = checklist.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);

                            this.userService.get(item.account_Finalizacao_Id!)
                                .then(res => item.account_Finalizacao = res.name);

                        })
                },
                reject: () => {
                    model.control.setValue(false);
                }
            });
        }
    }

        
    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }
    

    showPopover(e: any) {
        this.popover.show(e)
    }

    hidePopover() {
        this.popover.hide();
    }

    onPopoverShow() {
        var tab = $(`p-tab[ng-reflect-value="${this.checklistIndex}"]`).last()
        this.scrollLeft = $(tab).offset()?.left ?? 0
        $('.p-tablist-viewport').animate({
            scrollLeft: this.scrollLeft
        }, 300)
    }
}
