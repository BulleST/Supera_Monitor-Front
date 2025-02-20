import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserService } from '../../../services/user.service';
import { ColumnTable, Crypto, DisplayType, FilterType, getError, insertOrReplace } from '../../../utils';
import { Role } from '../../../models/account-perfil.model';
import { AccountService } from '../../../services/account.service';
import { MobileService, ScreenWidth } from '../../../utils/mobile';
import { AccountResponse, Account, userColumns } from '../../../models/account.model';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class ListComponent implements OnDestroy {
    list: Account[] = [];
    tableLoading = false;
    tableSearch: string = '';
    tableColumns: ColumnTable[] = [];
    tableGlobalFilterFields: string[] = [];
    tableSelectedItem: any;
    tableMenu: MenuItem[] = [];
    account?: AccountResponse;
    DisplayType: typeof DisplayType = DisplayType;
    FilterType: typeof FilterType = FilterType;
    Role: typeof Role = Role;
    screen: ScreenWidth = ScreenWidth.lg;
    subscription: Subscription[] = [];

    constructor(
        private confirmationService: ConfirmationService,
        private service: UserService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private accountService: AccountService,
        private mobileService: MobileService,
        private toastrService: ToastrService,
    ) {
        this.tableColumns = userColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);

        this.update();

        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var account = this.accountService.account.subscribe(account => this.account = account);
        this.subscription.push(account);

        var list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);

    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    update() {
        this.list = [];
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
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} o usuário selecionado? 
                      ${deactivated ? 'Esse usuário poderá acessar novamente a plataforma.' : 'Esse usuário será deslogado e não poderá acessar novamente enquanto estiver inativo.'} `,
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
                            this.toastrService.success( deactivated ? `O registro foi habilitado com sucesso.` : `O registro foi desabilitado com sucesso.`);
                            insertOrReplace(this.service, res.object);
                            item = res.object;
                        } else {
                            setTimeout(() => {
                                this.showError(res.message, e);
                            }, 300);
                        }
                    })
                    .catch((res: HttpErrorResponse) => {
                        this.showError(res.error.message, e);
                    })
            },
        });
    }

    resetPassword(e: any, item: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja resetar a senha deste usuário? 
                        Uma mensagem com a nova senha será enviada para o e-mail cadastrado.`,
            header: 'Resetar Senha?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Resetar Senha',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                lastValueFrom(this.service.resetPassword(item.id))
                    .then(res => {
                        if (res.success) {
                            item = res.object;
                            this.toastrService.success( `Senha resetada com sucesso e enviada para a caixa de email cadastrado.`);
                        } else {
                                this.showError(res.message, e);
                        }
                    })
                    .catch((res: HttpErrorResponse) => {
                        this.showError(res.error.message, e);
                    });
            },
        });
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Error',
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
}
