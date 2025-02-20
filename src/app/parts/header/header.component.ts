import { Component, OnDestroy, ViewChild } from '@angular/core';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { ThemeService } from '../../utils/theme';
import { Menubar } from 'primeng/menubar';
import { AccountService } from '../../services/account.service';
import { Role } from '../../models/account-perfil.model';
import { AccountResponse } from '../../models/account.model';
import { NavigationEnd, Router } from '@angular/router';
import { AulaService } from '../../services/aulas.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: false
})
export class HeaderComponent implements OnDestroy {
    faRegularBell = faBell;
    faChevronDown = faChevronDown;
    viewMenu: MenuItem[] = [];
    view = true;

    headerItem: MenuItem[] = [];
    subscription: Subscription[] = [];
    account?: AccountResponse;
    Role: typeof Role = Role;
    accountName = 'Noemi C. Almeida';
    accountAbreviacao = 'NC';
    @ViewChild('menuBig') menuBig?: Menubar;

    profileModalOpen: boolean = false;
    changePasswordModalOpen: boolean = false;
    showCalendarView = false;

    constructor(
        private header: Header,
        private theme: ThemeService,
        private accountService: AccountService,
        private router: Router,
        private aulaService: AulaService
    ) {

        this.router.events.subscribe(res => {
            if (res instanceof NavigationEnd) {
                this.showCalendarView = !!(res.url.includes('/home') && this.accountService.accountValue && this.accountService.accountValue.professor_Id);
                this.showCalendarView = res.url.includes('/home') == true;
            }
        });

        this.setView();
        this.setModal();
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    setView() {
        this.viewMenu =  [
            {
                label: 'Meu Calendário',
                value: true,
                icon: 'pi pi-user',
            }, {
                label: 'Calendário Geral',
                value: false,
                icon: 'pi pi-calendar',
            }
        ]
    }

    calendarViewChanged() {
        this.aulaService.calendarView.next(this.view);
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

}
