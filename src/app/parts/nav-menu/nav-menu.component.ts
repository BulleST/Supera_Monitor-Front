import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, output, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { faCalendar, faHome, faLocationDot, faMapPin, faPersonChalkboard, faUserGraduate, faUsers, faUsersBetweenLines, } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from '../../services/account.service';
import { RouterLinkActive } from '@angular/router';
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

    accountName = 'Noemi C. Almeida';
    accountAbreviacao = 'NC';
    account?: AccountResponse;

    @ViewChild('sidebar') sidebar!: Sidebar;
    @ViewChild('cm') cm!: ContextMenu;
    treeMenu: MenuItem[] = [
        {
            label: 'Editar',
            icon: 'pi pi-pencil'
        },
        {
            label: 'Apagar',
            icon: 'pi pi-trash'
        },
    ];

    constructor(
        private header: Header,
        private accountService: AccountService,
        private confirmationService: ConfirmationService,
    ) {
        this.items = [
            {
                label: 'Home',
                items: [
                    {
                        label: 'Calendário de Aulas',
                        tooltip: 'Calendário de Aulas',
                        iconFontawesome: faCalendar,
                        routerLink: '/home',
                        routerLinkActiveOptions: { exact: false },
                        routerLinkActive: 'active-link'
                    },
                    {
                        label: 'Monitoramento de Checklist',
                        tooltip: 'Monitoramento de Checklist',
                        iconFontawesome: faHome,
                        routerLink: '/checklist',
                        routerLinkActiveOptions: { exact: false },
                        routerLinkActive: 'active-link'
                    },
                ]
            },
            {
                label: 'Cadastros',
                items: [
                    {
                        label: 'Professores',
                        tooltip: 'Professores',
                        iconFontawesome: faPersonChalkboard,
                        routerLink: ['professores'],
                        routerLinkActiveOptions: { exact: false },
                        routerLinkActive: 'active-link'
                    },
                    {
                        label: 'Alunos',
                        tooltip: 'Alunos',
                        iconFontawesome: faUserGraduate,
                        routerLink: ['alunos'],
                        routerLinkActiveOptions: { exact: false },
                        routerLinkActive: 'active-link'
                    },
                    {
                        label: 'Turmas',
                        tooltip: 'Turmas',
                        iconFontawesome: faUsersBetweenLines,
                        routerLink: ['turmas'],
                        routerLinkActiveOptions: { exact: false },
                        routerLinkActive: 'active-link'
                    },
                    {
                        label: 'Usuários',
                        tooltip: 'Usuários',
                        iconFontawesome: faUsers,
                        routerLink: ['usuarios'],
                        routerLinkActiveOptions: { exact: false },
                        routerLinkActive: 'active-link'
                    },

                ]
            },
            {
                label: 'Minha conta'
            },
        ];

        var account = this.accountService.account.subscribe(account => {
            this.account = account;
            var array = account?.name.split(' ') as string[];
            this.accountName = array[0] ?? '';
            this.accountAbreviacao = array[0][0].toUpperCase();
            if (array.length > 1)
                this.accountAbreviacao += array[array.length - 1][0].toUpperCase();
        });
        this.subscription.push(account);
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
