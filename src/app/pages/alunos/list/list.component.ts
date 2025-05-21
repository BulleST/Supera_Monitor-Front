import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { ColumnTable, Crypto, DisplayType, FilterType, getError, insertOrReplace } from '../../../utils';
import { Role } from '../../../models/account-perfil.model';
import { MobileService, ScreenWidth } from '../../../utils/mobile';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno, alunosColumns } from '../../../models/alunos.model';
import { Aluno_CheckList_Item, Checklist } from '../../../models/checklist.model';
import { ChecklistService } from '../../../services/checklist.service';
import { CalendarioAlunoChecklistView } from '../../../models/calendario.model';
import moment from 'moment';
import { NgModel } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { Popover } from 'primeng/popover';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { ProfessorService } from '../../../services/professor.service';
import { Professor } from '../../../models/professor.model';
import { playAlert, playSuccess, showError } from '../../../utils';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class ListComponent implements OnDestroy {
    list: Aluno[] = [];
    tableLoading = false;
    tableSearch: string = '';
    tableColumns: ColumnTable[] = [];
    tableGlobalFilterFields: string[] = [];
    tableSelectedItem: any;
    tableMenu: MenuItem[] = [];
    DisplayType: typeof DisplayType = DisplayType;
    FilterType: typeof FilterType = FilterType;
    Role: typeof Role = Role;
    screen: ScreenWidth = ScreenWidth.lg;
    subscription: Subscription[] = [];

    professores: Professor[] = [];
    checklists: Checklist[] = [];
    loadingChecklist = false;
    checklistObservacao = '';

    selectedChecklist?: CalendarioAlunoChecklistView;
    @ViewChild('popoverChecklist') popoverChecklist!: Popover;



    constructor(
        private confirmationService: ConfirmationService,
        private service: AlunoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private mobileService: MobileService,
        private checklistService: ChecklistService,
        private toastrService: ToastrService,
        private userService: UserService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private professorService: ProfessorService,

    ) {
        this.tableColumns = alunosColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);

        this.update();

        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var list = this.service.list.subscribe(alunos => {
            this.list = alunos.map(aluno => {
                var semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",]
                aluno.turmaDesc = semana[aluno.diaSemana] + ' às ' + aluno.horario.toString().replace(':', 'h').substring(0, 5)

                aluno.created = moment(aluno.created).toDate();
                aluno.dataInicioVigencia = moment(aluno.dataInicioVigencia).toDate();
                aluno.dataNascimento = moment(aluno.dataNascimento).toDate();
                // Nuláveis
                aluno.lastUpdated = aluno.lastUpdated ? moment(aluno.lastUpdated).toDate() : undefined;
                aluno.deactivated = aluno.deactivated ? moment(aluno.deactivated).toDate() : undefined;
                aluno.dataFimVigencia = aluno.dataFimVigencia ? moment(aluno.dataFimVigencia).toDate() : undefined;

                return aluno;
            });
        });
        this.subscription.push(list);

        var checklist = this.checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklist);
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async update() {
        this.list = [];
        this.tableLoading = true;
        if (this.checklists.length == 0) {
            await lastValueFrom(this.checklistService.getList()).then(res => this.checklists = res);
        }

        if (this.professores.length == 0) {
            await lastValueFrom(this.professorService.getList()).then(res => this.professores = res);
        }

        if (!this.checklistService.list.value.length)
            await lastValueFrom(this.checklistService.getList())


        lastValueFrom(this.service.getListWithChecklist())
            .then(async alunos => {
                this.tableLoading = false;
                this.loadingChecklist = true
                this.list = alunos
            })
            .catch(res => {
                this.tableLoading = false;

            });
    }

    contextMenuSelectionChange(item: any) {
        this.tableMenu = [
            {

                label: 'Menu',
                disabled: true,
                styleClass: 'text-500 font-bold opacity-100',
            },
            { separator: true },
            {
                label: 'Detalhes',
                icon: 'fa-solid fa-pen text-orange-500',
                command: () => this.edit(item)
            },
            {
                label: item.active ? 'Desabilitar' : 'Habilitar',
                icon: item.active ? 'fa-solid fa-lock text-red-500' : 'fa-solid fa-lock-open text-green-400',
                command: (event: any) => this.deactivated(event, item)
            }

        ];
    }

    clear(dt: Table) {
        this.tableSearch = '';
        dt.clear();
    }

    @HostListener('keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        this.unselectItems();
    }

    selectionChange(e: any) {
    }

    unselectItems() {
        this.tableSelectedItem = undefined;
    }


    getCorLegenda(professor_Id: number) {
        var professor = this.professores.find(x => x.id == professor_Id);
        if (professor)
            return professor.corLegenda;
        return ''
    }

    edit(item: any) {
        var encrypted = this.crypto.encrypt(item.id);
        this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
    }

    deactivated(e: any, item: any) {
        playAlert();

        var deactivated = !item.active;
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} o aluno selecionado?`,
            header: deactivated ? 'Habilitar' : 'Desabilitar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: `${deactivated ? 'Habilitar' : 'Desabilitar'}`,
            acceptButtonStyleClass: 'p-button-rounded px-3 mr-0',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-text',
            accept: () => {
                lastValueFrom(this.service.deactivated(item.id, deactivated))
                    .then(res => {
                        if (res.success) {
                            item.active = res.object.active;
                            item.deactivated = res.object.deactivated;
                            insertOrReplace(this.service, item);
                            item = res.object;
                            playSuccess();
                        } else {
                            this.showError(`${deactivated ? 'Habilitar' : 'Desabilitar'} aluno falhou.`, res.message, e);
                        }
                    })
                    .catch(res => {
                        this.showError(`${deactivated ? 'Habilitar' : 'Desabilitar'} aluno falhou.`, getError(res), e);
                    })
            },
        });
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e)
    }

    getOption(col: ColumnTable, row: any) {
        var item = col.options.items.find((x: any) => x.value == row[col.field]);
        return item;
    }


    getCheckList(aluno: Aluno, checklist: Checklist) {
        if (!aluno.checklistCompleto)
            return undefined;
        return aluno.checklistCompleto.find(x => x.id == checklist.id);
    }

    checkboxChange(item: Aluno_CheckList_Item, checklist: CalendarioAlunoChecklistView, model: NgModel, e: any) {

        if (model.control.value) {
            model.control.setValue(false);

            playAlert();
            this.confirmationService.confirm({
                key: 'checklistConfirmation',
                message: `Tem certeza que deseja marcar item da jornada como realizada?.`,
                header: 'Finalizar item da jornada',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                acceptButtonStyleClass: 'p-button-rounded  px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Cancelar',
                rejectButtonStyleClass: 'p-button-rounded p-button-text',
                accept: async () => {
                    this.loadingChecklist = true;
                    item.observacoes = this.checklistObservacao
                    lastValueFrom(this.checklistService.markAsDone(item.id, this.checklistObservacao))
                        .then(res => {
                            this.checklistObservacao = '';
                            model.control.setValue(true);
                            this.loadingChecklist = false;
                            this.toastrService.success(`Checklist ${item.nome} finalizado com sucesso!`);
                            playSuccess();
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
                        .catch(res => {
                            this.showError('Erro', getError(res), e);
                        })
                },
                reject: () => {
                    model.control.setValue(false);
                },

            });
        }
    }

    popoverChecklistOpen(e: any, item: CalendarioAlunoChecklistView, aluno: Aluno) {
        this.popoverChecklist.show(e)
        this.selectedChecklist = item;
        this.tableSelectedItem = aluno
        if (this.popoverChecklist.container) this.popoverChecklist.align()
    }

    popoverChecklistClosed() {
        this.selectedChecklist = undefined;
        this.tableSelectedItem = undefined;
    }

    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    enviarMensagemApresentacaoDiretorFranqueado(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(aluno.nome, aluno.celular);
    }
    enviarMensagemBoasVindas(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(aluno.nome, aluno.celular);
    }
    enviarMensagemAdequacaoTurma(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(aluno.nome, aluno.celular);
    }
    enviarMensagemLembreteOficina(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(aluno.nome, aluno.celular);
    }
    enviarMensagemLembreteSuperacao(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(aluno.nome, aluno.celular);
    }
    enviarMensagemFeedbackPosVenda(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(aluno.nome, aluno.celular);
    }
    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.nome, aluno.celular);
    }

}
