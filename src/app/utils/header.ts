import { Injectable } from "@angular/core";
import { faCalendar, faHome, faPersonChalkboard, faUserGraduate, faUsers, faUsersBetweenLines } from "@fortawesome/free-solid-svg-icons";
import { MenuItem } from "primeng/api";
import { BehaviorSubject } from "rxjs";
import { AccountService } from "../services/account.service";
// import * as $ from 'jquery';
// import { Crypto } from "./crypto";
// import { Table } from "./table";

@Injectable({
    providedIn: 'root'
})
export class Header {
    menuAsideOpen = new BehaviorSubject<boolean>(true);
    minhaContaOpen = new BehaviorSubject<boolean>(false);
    sidebarWidth = new BehaviorSubject<any>(undefined);    
    accountData = new BehaviorSubject<{name: string, abreviacao: string, email: string} | undefined>(undefined);    
    navigationItems = new BehaviorSubject<MenuItem[]>([
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
                            {
                                label: 'Jornada',
                                tooltip: 'Jornada',
                                icon: 'bi bi-calendar-range',
                                routerLink: ['jornada'],
                                routerLinkActiveOptions: { exact: false },
                                routerLinkActive: 'active-link'
                            },
                        ]
                    },
                    {
                        label: 'Cadastros',
                        items: [
                            {
                                label: 'Alunos',
                                tooltip: 'Alunos',
                                iconFontawesome: faUserGraduate,
                                routerLink: ['alunos'],
                                routerLinkActiveOptions: { exact: false },
                                routerLinkActive: 'active-link'
                            },
                            {
                                label: 'Professores',
                                tooltip: 'Professores',
                                iconFontawesome: faPersonChalkboard,
                                routerLink: ['professores'],
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
    ]);
    
    
    constructor(
        private accountService: AccountService,
    ) {

        this.accountService.account.subscribe(account => {
            var a = {name: 'Noemi C. Almeida', abreviacao: 'NC', email: 'calmeida.no@gmail.com'};

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
