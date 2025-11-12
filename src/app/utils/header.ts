import { Injectable } from "@angular/core";
import { faCalendar, faHome, faPersonChalkboard, faUserGraduate, faUsers, faUsersBetweenLines } from "@fortawesome/free-solid-svg-icons";
import { MenuItem } from "primeng/api";
import { BehaviorSubject } from "rxjs";
import { AccountService } from "../services/account.service";

@Injectable({
    providedIn: 'root'
})
export class Header {
    menuAsideOpen = new BehaviorSubject<boolean>(false);
    minhaContaOpen = new BehaviorSubject<boolean>(false);
    sidebarWidth = new BehaviorSubject<any>(undefined);
    accountData = new BehaviorSubject<{ name: string, abreviacao: string, email: string } | undefined>(undefined);
    navigationItems = new BehaviorSubject<MenuItem[]>([
        {
            separator: true,
        },
        {
            label: 'Home',
            expanded: true,
            items: [
                {
                    label: 'Calendário de Aulas',
                    tooltip: 'Calendário de Aulas',
                    iconFontawesome: faCalendar,
                    routerLink: '/calendario',
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
                {
                    label: 'Monitoramento',
                    tooltip: 'Monitoramento',
                    // iconFontawesome: faCalendar,
                    icon: 'bi bi-table',
                    routerLink: ['monitoramento'],
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
                {
                    label: 'Jornada Supera',
                    tooltip: 'Jornada Supera',
                    icon: 'pi pi-check-square',
                    routerLink: '/jornada-supera',
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
                {
                    label: 'Roteiro',
                    tooltip: 'Roteiro',
                    icon: 'bi bi-calendar-range',
                    routerLink: ['roteiro'],
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
            ]
        },
        {
            separator: true,
        },
        {
            label: 'Cadastros',
            expanded: true,
            items: [
                {
                    label: 'Alunos',
                    tooltip: 'Alunos',
                    iconFontawesome: faUserGraduate,
                    routerLink: ['alunos'],
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
                {
                    label: 'Educadores',
                    tooltip: 'Educadores',
                    iconFontawesome: faPersonChalkboard,
                    routerLink: ['educadores'],
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
                {
                    label: 'Turmas',
                    tooltip: 'Turmas',
                    iconFontawesome: faUsersBetweenLines,
                    routerLink: ['turmas'],
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },
                {
                    label: 'Usuários',
                    tooltip: 'Usuários',
                    iconFontawesome: faUsers,
                    routerLink: ['usuarios'],
                    routerLinkActiveOptions: { exact: false },
                    routerLinkActive: 'active-link',
                    command: e => {
                        this.menuAsideOpen.next(false);
                    }
                },

            ]
        },
        // {
        //     separator: true,
        // },
        // {
        //     label: 'Minha conta',
        //     expanded: true,
        // },
    ]);


    constructor(
        private accountService: AccountService,
    ) {

        this.accountService.account.subscribe(account => {
            var a = { name: 'Noemi C. Almeida', abreviacao: 'NC', email: 'calmeida.no@gmail.com' };

            if (account) {
                var array = account.name.split(' ') as string[];
                a.name = array[0] ?? '';
                a.abreviacao = array[0][0].toUpperCase();
                a.email = account.email

                if (array.length > 1)
                    a.abreviacao += array[array.length - 1][0].toUpperCase();

            }


            this.accountData.next(a);
        });
    }

    toggleMenuAside(): void {
        this.setMenuAside(!this.menuAsideOpen.value);
    }

    setMenuAside(value: boolean) {
        // var encryted = this.crypto.encrypt(value) ?? '';
        // localStorage.setItem('navigation', encryted);
        this.menuAsideOpen.next(value);

    }


    toggleMenuMinhaConta(): void {
        this.minhaContaOpen.next(!this.minhaContaOpen.value);
    }

    openMenuMinhaConta() {
        this.minhaContaOpen.next(true);
    }

    closeMenuMinhaConta() {
        this.minhaContaOpen.next(false);
    }

    clickOut() {
        // var classe = this;
        // $('body').on('click', function (e) {
        //     classe.closeMenuMinhaConta();
        //     classe.setMenuAside(false);
        // });

        // $('.navigation-toggle-content').on('click', function (e) {
        //     classe.setMenuAside(true);
        // });

        // $('.navigation-content*').each((i, el) => {
        //     $(el).on('click', function (e) {
        //         e.stopPropagation();
        //     });
        // })
        // $('.navigation-content').on('click', function (e) {
        //     e.stopPropagation();
        // });
    }
}
