import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { ColumnTable, Crypto, DisplayType, FilterType, getError, showError } from '../../../utils';
import { Role } from '../../../models/account-perfil.model';
import { MobileService, ScreenWidth } from '../../../utils/mobile';
import { Professor, Professor_NivelCertificacao, professorColumns } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ContextMenu } from 'primeng/contextmenu';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class ListComponent implements OnDestroy {
    list: Professor[] = [];
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

    @ViewChild('cm') cm!: ContextMenu;

    nivelCertificados: Professor_NivelCertificacao[] = []
    loadingNivelCertificados = true;

    constructor(
        private confirmationService: ConfirmationService,
        private service: ProfessorService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private mobileService: MobileService,
        private userService: UserService,
        private toastrService: ToastrService,
    ) {
        this.tableColumns = professorColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);
        
        this.loadingNivelCertificados = true;
        lastValueFrom(this.service.getNivelCertificacao())
        .then(res => {
            this.nivelCertificados = res;
            this.loadingNivelCertificados = false;

            let columnIndex = professorColumns.findIndex(x => x.field == 'professor_NivelCertificacao')
            let column = professorColumns[columnIndex];
                
            column.filterOptions.value = res.map(x=> x.descricao)
            column.filterOptions!.primeElementOptions.options = res.map(x => {
                return {
                    label: x.descricao,
                    value: x.descricao,
                }
            });
    
            professorColumns[columnIndex] = column
            this.tableColumns = professorColumns;
        })
        
        
        let screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);
        
        let list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);
        
        if (!this.list.length) this.update()
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    update() {
        this.tableLoading = true;
        lastValueFrom(this.service.getList())
            .then(res => this.tableLoading = false)
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
                command: () => {
                    let encrypted = this.crypto.encrypt(item.id);
                    this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
                }
            },
            {
                label: item.active ? 'Desabilitar' : 'Habilitar',
                icon: item.active ? 'fa-solid fa-lock text-red-500' : 'fa-solid fa-lock-open text-green-400',
                command: (event: any) => this.deactivated(event, item)
            },
            {
                label: 'Resetar Senha',
                icon: 'fa-solid fa-key text-grey-400',
                command: (event: any) => this.resetPassword(event, item)
            },
            // { separator: true },
            // {
            //     label: 'Calendário de aulas',
            //     icon: 'fa-solid fa-calendar',
            //     command: () => {
            //         let encrypted = this.crypto.encrypt(item.id);
            //         this.router.navigate(['calendario', encrypted], { relativeTo: this.activatedRoute });
            //     }
            // },


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

    getOption(col: ColumnTable, row: any) {
        let item = col.options.items.find((x: any) => x.value == row[col.field]);
        return item;
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }


    deactivated(e: any, item: any) {
        let deactivated = !item.active;

        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} o professor selecionado? 
                      ${deactivated ? 'Esse usuário poderá acessar novamente a plataforma.' : 'Esse usuário será deslogado e não poderá acessar novamente enquanto estiver inativo.'} `,
            header: deactivated ? 'Habilitar' : 'Desabilitar',

            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',

            acceptIcon: deactivated ? 'fa-solid fa-lock-open' : 'fa-solid fa-lock',
            rejectIcon: 'pi pi-times',

            acceptLabel: `${deactivated ? 'Habilitar' : 'Desabilitar'}`,
            rejectLabel: 'Cancelar',

            accept: () => {
                lastValueFrom(this.userService.deactivated(item.account_Id, deactivated))
                    .then(res => {
                        if (res.success) {
                            this.toastrService.success(deactivated 
                                ? `O registro foi habilitado com sucesso.` 
                                : `O registro foi desabilitado com sucesso.`);
                            item = res.object;
                            // playSuccess();
                        } else {
                            this.showError('Erro', res.message, e);
                        }
                    })
                    .catch(res => {
                        this.showError('Erro', getError(res), e);
                    })
            },
        });
    }

    resetPassword(e: any, item: any) {
        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja resetar a senha deste professor? 
                        Uma mensagem com a nova senha será enviada para o e-mail cadastrado.`,
            header: 'Resetar Senha?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Resetar Senha',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                lastValueFrom(this.userService.resetPassword(item.account_Id))
                    .then(res => {
                        if (res.success) {
                            this.toastrService.success(`Senha resetada com sucesso e enviada para a caixa de email cadastrado.`);
                            item = res.object;
                            // playSuccess();
                        } else {
                            this.showError('Erro', res.message, e);
                        }
                    })
                    .catch(res => {
                        this.showError('Erro', getError(res), e);
                    });
            },
        });

    }

    showContextMenu(e: any, item: Professor) {
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
                label: 'Editar',
                icon: 'fa-solid fa-pen text-orange-500',
                command: () => this.edit(item)
            },
            {
                label: item.active ? 'Desabilitar' : 'Habilitar',
                icon: item.active ? 'fa-solid fa-lock text-red-500' : 'fa-solid fa-lock-open text-green-400',
                command: (event: any) => this.deactivated(event, item)
            },
            {
                label: 'Resetar Senha',
                icon: 'fa-solid fa-key text-grey-400',
                command: (event: any) => this.resetPassword(event, item)
            },
            // { separator: true },
            // {
            //     label: 'Calendário de aulas',
            //     icon: 'fa-solid fa-calendar',
            //     command: () => {
            //         let encrypted = this.crypto.encrypt(item.id);
            //         this.router.navigate(['calendario', encrypted], { relativeTo: this.activatedRoute });
            //     }
            // },
        ];

        if (toggle) {
            this.cm.toggle(e);
        } else {
            this.cm.show(e);
        }
    }

    edit(item: any) {
        let encrypted = this.crypto.encrypt(item.id);
        this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
    }

    filterDateTime(value: any, col: ColumnTable, callback: Function, dt: Table) {


        let filterService = dt.filterService;
        let filterDt: any = dt.filters[col.field];
        let matchMode = filterDt['matchMode'];
        let filter: any = dt.filters[col.field];

        let a = filter(value)







    }

}
