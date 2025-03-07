import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, output, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { faCalendar, faHome, faPersonChalkboard, faUserGraduate, faUsers, faUsersBetweenLines, } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from '../../services/account.service';
import { AccountResponse } from '../../models/account.model';

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

    @ViewChild('sidebar') sidebar!: Sidebar;
    @ViewChild('cm') cm!: ContextMenu;
   
    constructor(
        private header: Header,
        private accountService: AccountService,
        private confirmationService: ConfirmationService,
    ) {

        var accountData = this.header.accountData.subscribe(res => this.accountData = res)
        this.subscription.push(accountData);

        var navigationItems = this.header.navigationItems.subscribe(res => this.items = res);
        this.subscription.push(navigationItems);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {

    }

    setMenu() {
        this.menuOpen = !this.menuOpen;
        this.header.menuAsideOpen.next(this.menuOpen);
    }



    logout(e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja sair?`,
            header: 'Sair',
            icon: 'pi pi-exclamation-triangle',
            closeOnEscape: true,
            acceptLabel: `Sair`,
            acceptButtonStyleClass: 'text-center',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-outlined text-center',
            accept: () => {
                this.accountService.logout();
            },
        });

    }
}
