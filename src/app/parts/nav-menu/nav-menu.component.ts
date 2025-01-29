import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, output, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { faCalendar, faHome, faLocationDot, faMapPin, faPersonChalkboard, faUserGraduate, faUsers, faUsersBetweenLines, } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from '../../services/account.service';

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
    @ViewChild('sidebar') sidebar!: Sidebar;
    @ViewChild('cm') cm!: ContextMenu;
    @Output('menuOpen') menuOpenEvent: EventEmitter<boolean> = new EventEmitter();
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
                        label: 'Dashboard',
                        tooltip: 'Dashboard',
                        iconFontawesome: faHome
                    },
                    {
                        label: 'Calendário',
                        tooltip: 'Calendário',
                        iconFontawesome: faCalendar
                        // icon: 'bi bi-calendar-week'
                    }
                ]
            },
            {
                label: 'Cadastros',
                items: [
                    {
                        label: 'Professores',
                        tooltip: 'Professores',
                        iconFontawesome: faPersonChalkboard,
                        routerLink: ['professores']
                    },
                    {
                        label: 'Alunos',
                        tooltip: 'Alunos',
                        iconFontawesome: faUserGraduate,
                        routerLink: ['alunos']
                    },
                    {
                        label: 'Turmas',
                        tooltip: 'Turmas',
                        iconFontawesome: faUsersBetweenLines,
                        // iconImage: 'icon-turma.png',
                        routerLink: ['turmas']
                    },
                    {
                        label: 'Salas de Aula',
                        tooltip: 'Salas de Aula',
                        // iconFontawesome: faLocationDot,
                        icon: 'bi bi-pin-map-fill',
                        // iconImage: 'icon-turma.png',
                        routerLink: ['turmas']
                    },
                    {
                        label: 'Usuários',
                        tooltip: 'Usuários',
                        iconFontawesome: faUsers,
                        routerLink: ['usuarios']
                    },

                ]
            },
            {
                label: 'Minha conta',
                // items: [
                //     {
                //         label: 'Configurações',
                //         icon: 'pi pi-cog',
                //         // shortcut: '⌘+O'
                //     },
                //     {
                //         label: 'Notificações',
                //         icon: 'pi pi-inbox',
                //         badge: '2'
                //     },
                //     {
                //         label: 'Sair',
                //         icon: 'pi pi-sign-out',
                //         // shortcut: '⌘+Q'
                //     }
                // ]
            },
        ];

        // this.menuOpen = this.header.menuAsideOpen.value;
        // var open = this.header.menuAsideOpen.subscribe(res => {
        //     this.menuOpen = res;
        //     this.setWidth();
        // });
        // this.subscription.push(open);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {

    }

    setMenu() {
        this.menuOpen = !this.menuOpen;
        this.menuOpenEvent.emit(this.menuOpen)
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
