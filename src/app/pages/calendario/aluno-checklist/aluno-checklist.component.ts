import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Aluno_CheckList_Item, Checklist } from '../../../models/checklist.model';
import { AlunoChecklistCompleto } from '../../../models/calendario.model';
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
import { Aluno } from '../../../models/alunos.model';

@Component({
    selector: 'app-aluno-checklist-calendario',
    standalone: false,
    templateUrl: './aluno-checklist.component.html',
    styleUrl: './aluno-checklist.component.css',
    providers: [ConfirmationService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlunoChecklistComponent implements OnChanges, OnDestroy, AfterViewInit {
    @Input() participacao?: Evento_Participacao_Aluno;
    @Input() aluno?: Aluno;
    item: Aluno | Evento_Participacao_Aluno = undefined as any;

    loading: boolean = false;
    checklists: Checklist[] = [];
    subscription: Subscription[] = [];
    visible = false;

    @ViewChild('popover') popover!: Popover
    @ViewChild('tabs') tabs!: Tabs;
    @ViewChildren('tab') tab!: QueryList<Tabs>;

    textoChecklist = '';
    checklistObservacao = '';
    checklist?: AlunoChecklistCompleto;
    atrasado = false;

    checklistIndex: number = 0;
    scrollLeft: number = 0;

    constructor(
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private service: ChecklistService,
        private userService: UserService,
    ) {
        var checklist = this.service.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklist);

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['participacao']) {
            this.participacao = changes['participacao'].currentValue as Evento_Participacao_Aluno;
            this.item = this.participacao;
        }
        
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue as Aluno;
            this.item = this.aluno;
        }

            if ((!this.item.alunoChecklist
                || !this.item.alunoChecklist.length
                || !this.item.checklistCompleto
                || !this.item.checklistCompleto.length)) {
                await this.loadChecklistAluno();
                this.setChecklist();
            } else {
                this.setChecklist();
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

        var id = 0;
        if (this.participacao) {
            var id = this.participacao.aluno_Id;
        }
        if (this.item) {
            var id = this.item.id;
        }
        await lastValueFrom(this.service.getChecklistAluno(id))
            .then(res => {
                this.item.alunoChecklist = res.filter(x => x.aluno_Id == id)
                    .map(checklistAluno => {
                        checklistAluno.finalizado = !!checklistAluno.dataFinalizacao;
                        return checklistAluno
                    });
                this.item.checklistCompleto = this.checklists
                    .map(checklist => {
                        var checklistAluno = new AlunoChecklistCompleto;
                        checklistAluno.id = checklist.id;
                        checklistAluno.nome = checklist.nome;
                        checklistAluno.items = res.filter(x => x.checklist_Id == checklist.id);
                        checklistAluno.prazo = checklistAluno.items[0]?.prazo ?? undefined;
                        checklistAluno.itensFinalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                        checklistAluno.itensAtrasados = checklistAluno.items.filter((x: any) => !x.finalizado && moment(x.prazo).week() < moment(new Date).week());
                        checklistAluno.itensEmAndamento = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                        return checklistAluno;
                    });
                this.loading = false;
            })
    }

    setChecklist() {

        if (this.item.checklist_Id) {
            this.checklist = this.item.checklistCompleto.find(x => x.id == this.item.checklist_Id) as AlunoChecklistCompleto;
            this.checklistIndex = this.item.checklist_Id;
        }
        else if (!this.item.checklist_Id && this.item.checklistCompleto && this.item.checklistCompleto.length > 0) {

            this.checklist = this.item.checklistCompleto[this.item.checklistCompleto.length - 1]
            this.checklistIndex = this.checklist.id;

            var pendentesDaSemana = this.item.checklistCompleto.filter(x => x.itensEmAndamento.length)
            var atrasados = this.item.checklistCompleto.filter(x => x.itensAtrasados.length > 0);
            this.atrasado = atrasados.length > 0;
            if (atrasados.length > 0) this.textoChecklist = '90 dias encerrados com itens em atraso';
            if (atrasados.length == 0 && pendentesDaSemana.length == 0) this.textoChecklist = '90 dias concluídos';
        }

    }


    checkboxChange(item: Aluno_CheckList_Item, checklist: AlunoChecklistCompleto, model: NgModel, e: any) {
        if (model.control.value) {
            if (moment(item.prazo).week() > moment(new Date).week()) {
                this.showError('Checklist indisponível', 'Você não pode finalizar esse checklist ainda.', e);
                model.control.setValue(false);
                return;
            }

            // playAlert();

            this.confirmationService.confirm({
                key: 'checklistConfirmation',
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                icon: 'pi pi-comment-dots text-4xl mr-2',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    this.loading = true;
                    item.observacoes = this.checklistObservacao
                    lastValueFrom(this.service.markAsDone(item.id, item.observacoes))
                        .then(res => {
                            // playSuccess();
                            this.checklistObservacao = '';
                            this.loading = false;
                            this.toastrService.success(`Checklist ${item.nome} finalizado com sucesso!`);
                            item.finalizado = true;
                            item.dataFinalizacao = res.object.dataFinalizacao;
                            item.account_Finalizacao_Id = res.object.account_Finalizacao_Id;

                            checklist.prazo = checklist.items[0].prazo;
                            checklist.itensFinalizados = checklist.items.filter((x: any) => x.finalizado)
                            checklist.itensAtrasados = checklist.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                            checklist.itensEmAndamento = checklist.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);

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

    show() {
        this.visible = true;
        var nome = this.item instanceof Evento_Participacao_Aluno ? this.item.aluno : this.item.nome;
        this.confirmationService.confirm({
            key: 'checklistAluno',
            header: 'Jornada Supera do ' + nome,
            rejectVisible: false,
            acceptButtonStyleClass: 'p-button-rounded',
            acceptLabel: 'Fechar',
            accept: () => {
                this.visible = false;
            }
        })
    }

    hide() {
        this.visible = false;
        this.confirmationService.close();
    }

    onPopoverShow() {
        this.visible = true;
        var tab = $(`p-tab[ng-reflect-value="${this.checklistIndex}"]`).last()
        this.scrollLeft = $(tab).offset()?.left ?? 0
        $('.p-tablist-viewport').animate({
            scrollLeft: this.scrollLeft
        }, 300)
    }
}
