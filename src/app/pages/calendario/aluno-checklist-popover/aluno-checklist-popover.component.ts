import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { TabList, Tabs } from 'primeng/tabs';
import $ from 'jquery';

@Component({
    selector: 'app-aluno-checklist-popover',
    standalone: false,
    templateUrl: './aluno-checklist-popover.component.html',
    styleUrl: './aluno-checklist-popover.component.css'
})
export class AlunoChecklistPopoverComponent implements OnChanges, OnDestroy , AfterViewInit {
    @Input() aluno: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
    @Output() alunoChanged = new EventEmitter<Evento_Participacao_Aluno>();
    loading: boolean = false;
    checklists: Checklist[] = [];
    subscription: Subscription[] = [];

    @ViewChild('popover') popover!: Popover
    @ViewChild('tabs') tabs!: Tabs;

    constructor(
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private service: ChecklistService,
        private userService: UserService,
    ) {
        var checklist = this.service.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklist);

    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            if(!this.aluno.alunoChecklist || !this.aluno.alunoChecklist.length )
                this.loadChecklistAluno();
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async loadChecklistAluno() {
        if (this.checklists.length == 0) {
            this.loading = true;
            await lastValueFrom(this.service.getList())
        }

        this.loading = true;
        lastValueFrom(this.service.getChecklistAluno(this.aluno.aluno_Id))
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
                this.alunoChanged.emit(this.aluno)
            })

    }

    ngAfterViewInit(): void {
        
    }

    checkboxChange(item: Aluno_CheckList_Item, checklist: CalendarioAlunoChecklistView, model: NgModel, e: any) {
        if (model.control.value) {
            if (moment(item.prazo).week() > moment(new Date).week()) {
                this.showError('Checklist indisponível', 'Você não pode finalizar esse checklist ainda.', e);
                model.control.setValue(false);
                return;
            }

            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    this.loading = true;
                    lastValueFrom(this.service.markAsDone(item.id))
                        .then(res => {
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
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-4xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    show(e: any) {
        this.popover.show(e)
    }

    hide() {
        this.popover.hide();
    }


}
