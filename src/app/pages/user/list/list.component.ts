import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Account, Account_List } from '../../../models/account.model';
import { ColumnTable, DisplayType } from '../../../utils/table';
import { ConfirmationService } from 'primeng/api';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { Crypto, getError, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { Table } from 'primeng/table';  
import { Role } from '../../../models/account-perfil.model';
import { AccountService } from '../../../services/account.service';
import { MobileService, ScreenWidth } from '../../../utils/mobile';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    providers: [ConfirmationService]
})
export class ListComponent implements OnDestroy {
    faKey = faKey;

    list: Account_List[] = [];
    tableLoading = false;
    tableSearch: string = '';
    tableColumns: ColumnTable[] = [];
    tableGlobalFilterFields: string[] = [];
    tableSelectedItems: any[] = [];
    tableSelectedItem: any;
    DisplayType = DisplayType;
    account?: Account;
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
        private translate: TranslateService,
        private mobileService: MobileService
    ) {

        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var account = this.accountService.account.subscribe(account => this.account = account);
        this.subscription.push(account);

        this.translate.get(['Users'])
            .subscribe(translations => {
                console.log('translations', translations);
            });




        var list = this.service.list.subscribe(res => {
            this.list = res;

            if (this.tableSelectedItem) {
                var index = res.findIndex(x => x.id == this.tableSelectedItem.id);
                if (index == -1)
                    delete this.tableSelectedItem;
            }
        });
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
            .catch(res => this.tableLoading = false);
    }



    edit() {
        var encrypted = this.crypto.encrypt(this.tableSelectedItem.id);
        this.router.navigate(['edit', encrypted], { relativeTo: this.activatedRoute });
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
        this.tableSelectedItem = e;
    }

    unselectItems() {
        this.tableSelectedItem = undefined;
        this.tableSelectedItems = [];
    }

    deactivated(e: any) {
        var deactivated = !this.tableSelectedItem.active;

        this.confirmationService.confirm({
            target: e.target,
            message: `Are you sure you want to ${deactivated ? 'enable' : 'disable'} the selected item? 
                                                    \r\n You won't be able to assign this item to other new records.
                                                    \r\n This user will be logged out and will not be able perform any action. `,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: `${deactivated ? 'Enable' : 'Disable'}`,
            acceptIcon: 'none',
            acceptButtonStyleClass: 'p-button-sm mr-0',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                lastValueFrom(this.service.deactivated(this.tableSelectedItem.id, deactivated))
                    .then(res => {
                        if (res.success) {
                            insertOrReplace(this.service, res.object);
                            this.tableSelectedItem = res.object;
                        } else {
                            setTimeout(() => {
                                this.showError(res.message, e);
                            }, 300);
                        }
                    })
                    .catch(res => {
                        this.showError(getError(res), e);
                    })
            },
        });
    }


    resetPasswordConfirm(e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: 'Are you sure you want reset password for the selected user?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Reset password',
            acceptIcon: "none",
            acceptButtonStyleClass: 'p-button-sm mr-0',
            rejectIcon: "none",
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                lastValueFrom(this.service.resetPassword(this.tableSelectedItem.id))
                    .then(res => {
                        if (res.success) {
                            this.tableSelectedItem = res.object;
                        } else {
                            setTimeout(() => {
                                this.showError(res.message, e);
                            }, 300);
                        }
                    })
                    .catch(res => {
                        this.showError(getError(res), e);
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
            acceptIcon: "none",
            acceptLabel: 'Ok',
            acceptButtonStyleClass: 'p-button-sm mr-0',
            rejectVisible: false,
        });
    }

    getOption(col: ColumnTable, row: any) {
        var item = col.options.items.find((x: any) => x.value == row[col.field]);
        return item;
    }
}
