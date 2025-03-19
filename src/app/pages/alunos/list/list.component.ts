import { Component, HostListener, OnDestroy } from '@angular/core';
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

    checklists: Checklist[] = [];
    loadingChecklist = false;

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
    ) {
        this.tableColumns = alunosColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);

        this.update();

        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);

        var checklist = this.checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklist);
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    update() {
        this.list = [];
        this.tableLoading = true;
        lastValueFrom(this.service.getList())
            .then(async alunos => {
                this.tableLoading = false;
                this.loadingChecklist = true
                if (this.checklists.length == 0) {
                    await lastValueFrom(this.checklistService.getList()).then(res => this.checklists = res);
                }

                alunos = alunos.map(aluno => {
                    aluno.checklistCompleto = this.checklists.map(checklist => {
                        var checklistAluno = new CalendarioAlunoChecklistView;
                        checklistAluno.id = checklist.id;
                        checklistAluno.nome = checklist.nome;
                        checklistAluno.items = aluno.alunoChecklist.filter(x => x.checklist_Id == checklist.id);
                        checklistAluno.prazo = checklistAluno.items[0].prazo;
                        checklistAluno.finalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                        checklistAluno.atrasados = checklistAluno.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                        checklistAluno.pendentesDaSemana = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                        return checklistAluno;
                    });
                    return aluno
                })
                this.service.list.next(alunos);
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
                label: 'Editar',
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

    edit(item: any) {
        var encrypted = this.crypto.encrypt(item.id);
        this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
    }

    deactivated(e: any, item: any) {
        var deactivated = !item.active;
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} o aluno selecionado?`,
            header: deactivated ? 'Habilitar' : 'Desabilitar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: `${deactivated ? 'Habilitar' : 'Desabilitar'}`,
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                lastValueFrom(this.service.deactivated(item.id, deactivated))
                    .then(res => {
                        if (res.success) {
                            item.active = res.object.active;
                            item.deactivated = res.object.deactivated;
                            insertOrReplace(this.service, item);
                            item = res.object;
                        } else {
                            setTimeout(() => {
                                this.showError(`${deactivated ? 'Habilitar' : 'Desabilitar'} aluno falhou.`, res.message, e);
                            }, 300);
                        }
                    })
                    .catch(res => {
                        this.showError(`${deactivated ? 'Habilitar' : 'Desabilitar'} aluno falhou.`, getError(res), e);
                    })
            },
        });
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
        });
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
            if (moment(item.prazo).week() > moment(new Date).week()) {
                this.showError('Checklist indisponível', `Você não pode finalizar esse checklist ainda. \n Prazo inicial a partir do dia ${moment(item.prazo).add(-7, 'day').format('DD/MM/YY')}`, e);
                model.control.setValue(false); 
                return;
            }
            
            if(!item.prazo) {   
                this.showError('Checklist indisponível', `O aluno não possui data de vigência`, e);
                model.control.setValue(false); 
                return;
            }
            
            model.control.setValue(false);

            var a = this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    this.loadingChecklist = true;
                    lastValueFrom(this.checklistService.markAsDone(item.id))
                        .then(res => {
                            
                            model.control.setValue(true);
                            this.loadingChecklist = false;
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
                    console.log('reject')
                    
                    model.control.setValue(false);
                },
                
            });
        }
    }


}
