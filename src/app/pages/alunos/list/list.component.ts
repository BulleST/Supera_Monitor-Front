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
import { Checklist } from '../../../models/checklist.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { showError } from '../../../utils';
import { AlunoPopoverComponent } from '../../../shared/aluno/aluno-popover/aluno-popover.component';
import { ContextMenu } from 'primeng/contextmenu';

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


    @ViewChild('popoverAluno') popoverAluno!: AlunoPopoverComponent;
    @ViewChild('cm') cm!: ContextMenu;


    constructor(
        private confirmationService: ConfirmationService,
        private service: AlunoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private mobileService: MobileService,
        private mensagemWhatsapp: MensagemWhatsapp,

    ) {
        this.tableColumns = alunosColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);


        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);

        this.update()
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async update() {
        this.list = [];
        this.tableLoading = true;

        lastValueFrom(this.service.getList())
            .then(async alunos => {
                this.tableLoading = false;
                this.list = alunos
            })
            .catch(res => {
                this.tableLoading = false;
            });
    }

    showContextMenu(e: any, item: Aluno) {
        const toggle = this.tableSelectedItem?.id == item.id;

        this.tableSelectedItem = item;
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

        if (toggle) {
            this.cm.toggle(e);
        } else {
            this.cm.show(e);
        }
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
        // playAlert();

        var deactivated = !item.active;
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} o aluno selecionado?`,
            header: deactivated ? 'Habilitar' : 'Desabilitar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: `${deactivated ? 'Habilitar' : 'Desabilitar'}`,
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                lastValueFrom(this.service.deactivated(item.id, deactivated))
                    .then(res => {
                        if (res.success) {
                            item.active = res.object.active;
                            item.deactivated = res.object.deactivated;
                            insertOrReplace(this.service, item);
                            item = res.object;
                            // playSuccess();
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

    enviarMensagem(aluno: Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    showPopoverAluno(aluno: Aluno, e: any) {
        this.popoverAluno.aluno_Id = aluno.id;
        this.popoverAluno.aluno = aluno;
        this.popoverAluno.showChecklist = true;
        this.popoverAluno.show(e);
    }
}
