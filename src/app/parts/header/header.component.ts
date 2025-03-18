import { Component, OnDestroy, ViewChild } from '@angular/core';
import { faBell, faCalendar, faHome, faPersonChalkboard, faUserGraduate, faUsers, faUsersBetweenLines } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { ThemeService } from '../../utils/theme';
import { Menubar } from 'primeng/menubar';
import { AccountService } from '../../services/account.service';
import { Role } from '../../models/account-perfil.model';
import { NavigationEnd, Router } from '@angular/router';
import { AulaService } from '../../services/aulas.service';
import { MobileService, ScreenWidth } from '../../utils/mobile';
import { MegaMenu } from 'primeng/megamenu';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: false
})
export class HeaderComponent implements OnDestroy {
    faRegularBell = faBell;
    faChevronDown = faChevronDown;

    headerItem: MenuItem[] = [];
    subscription: Subscription[] = [];
   
    accountData:{name: string, abreviacao: string, email: string} | undefined;

    Role: typeof Role = Role;
    @ViewChild('menuBig') menuBig?: Menubar;

    profileModalOpen: boolean = false;
    changePasswordModalOpen: boolean = false;

    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth: typeof ScreenWidth = ScreenWidth;
    items: MenuItem[] | undefined;


    menuMobileOpen = false;

    constructor(
        private theme: ThemeService,
        private accountService: AccountService,
        private router: Router,
        private aulaService: AulaService,
        private mobileService: MobileService,
        private header: Header,
    ) {

        var screen = this.mobileService.get().subscribe(res => this.screen = res)
        this.subscription.push(screen);

        var accountData = this.header.accountData.subscribe(res => this.accountData = res)
        this.subscription.push(accountData);

        // var navigationItems = this.header.navigationItems.subscribe(res => this.items = res);
        // this.subscription.push(navigationItems);
        this.items = [
                                    {
                                        label: 'Calendário de Aulas',
                                        tooltip: 'Calendário de Aulas',
                                        iconFontawesome: faCalendar,
                                        routerLink: ['home'],
                                        routerLinkActiveOptions: { exact: false },
                                        routerLinkActive: 'active-link'
                                    },
                                    {
                                        label: 'Monitoramento de Checklist',
                                        tooltip: 'Monitoramento de Checklist',
                                        iconFontawesome: faHome,
                                        routerLink: ['checklist'],
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
                
                            {
                                label: 'Minha conta',
                                routerLink: [],
                            },
            ]

        this.setModal();
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }
    

    setModal() {

        var profile = localStorage.getItem('profile') == 'true';
        this.accountService.profileModalOpen.emit(profile);

        var changePassword = localStorage.getItem('change-password') == 'true';
        this.accountService.profileModalOpen.emit(changePassword);

    }

    toggleAside() {
        this.header.toggleMenuAside();
    }

    toggleMenu(e: any) {
        this.menuBig?.show();
    }

    toggleThemeAside() {
        this.theme.toggleThemeAside();
    }


    menuClick(e: any, menuBar: MegaMenu) {
        console.log(e, menuBar)
        menuBar.toggle(e);
    }

    toggleMenuMobile(button: Button, navigation: HTMLElement) {
        console.log(button)
        this.menuMobileOpen = !this.menuMobileOpen;

        if (this.menuMobileOpen) {


        }
        else {

        }
        
    }

}
