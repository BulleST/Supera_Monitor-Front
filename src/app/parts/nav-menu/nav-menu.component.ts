import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { SelectChangeEvent } from 'primeng/select';
import { UrlService } from '../../utils/url.service';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css'],
    providers: [ConfirmationService],
    standalone: false
})
export class NavMenuComponent implements OnDestroy, AfterViewInit {
    items: MenuItem[] | undefined;
    menuOpen: boolean = true;
    subscription: Subscription[] = [];
    treeNodes: TreeNode[] = [];
    loading = false;
    selectedNode: any;

    accountData: {name: string, abreviacao: string, email: string} | undefined;

    account?: Account;

    @ViewChild('sidebar') sidebar!: Sidebar;
    @ViewChild('cm') cm!: ContextMenu;

    urlSelected: string = '';
    options = [
        {
            label: 'Local',
            value: 'https://localhost:7281/back'
        },
        {
            label: 'PRD',
            value: 'https://supera-monitor-back-e4hwhteuewdmd8ea.canadacentral-01.azurewebsites.net/back'
        }
    ]
   
    constructor(
        private header: Header,
        private accountService: AccountService,
        private urlService: UrlService,
        private confirmationService: ConfirmationService,
    ) {

        this.menuOpen = this.header.menuAsideOpen.value;

        let menuAsideOpen = this.header.menuAsideOpen.subscribe(res => this.menuOpen = res)
        this.subscription.push(menuAsideOpen);

        let accountData = this.header.accountData.subscribe(res => this.accountData = res)
        this.subscription.push(accountData);

        let navigationItems = this.header.navigationItems.subscribe(res => this.items = res);
        this.subscription.push(navigationItems);

        let account = this.accountService.accountSubject.subscribe(res => this.account = res);
        this.subscription.push(account);

        let urlSelected = this.urlService.getUrl().subscribe(res => this.urlSelected = res);
        this.subscription.push(urlSelected);


    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {

    }

    setMenu() {
        this.header.menuAsideOpen.next(!this.menuOpen);
    }

    urlChange(e: SelectChangeEvent) {
        this.urlService.setUrl(e.value)
    }


    logout(e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja sair?`,
            header: 'Sair',
            closeOnEscape: true,
            acceptLabel: `Sair`,
            acceptIcon: 'pi pi-sign-out',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.accountService.logout();
            },
        });

    }
}
