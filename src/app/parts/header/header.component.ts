import { Component, OnDestroy, ViewChild } from '@angular/core';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { ThemeService } from '../../utils/theme';
import { Menubar } from 'primeng/menubar';
import { AccountService } from '../../services/account.service';
import { Role } from '../../models/account-perfil.model';
import { Router } from '@angular/router';
import { MobileService, ScreenWidth } from '../../utils/mobile';
import { MegaMenu } from 'primeng/megamenu';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: false,
    providers: [ConfirmationService],
})
export class HeaderComponent implements OnDestroy {
    faRegularBell = faBell;
    faChevronDown = faChevronDown;

    headerItem: MenuItem[] = [];
    subscription: Subscription[] = [];

    accountData: { name: string, abreviacao: string, email: string } | undefined;

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
        private mobileService: MobileService,
        private header: Header,
        private confirmationService: ConfirmationService,
    ) {

        var menuAsideOpen = this.header.menuAsideOpen.subscribe(res => this.menuMobileOpen = res)
        this.subscription.push(menuAsideOpen);
        var screen = this.mobileService.get().subscribe(res => this.screen = res)
        this.subscription.push(screen);

        var accountData = this.header.accountData.subscribe(res => this.accountData = res)
        this.subscription.push(accountData);

        var navigationItems = this.header.navigationItems.subscribe(res => {
            this.items = res;//.filter(x => x.items && x.items.length > 0).flatMap(x => x.items) as MenuItem[];
        });
        this.subscription.push(navigationItems);

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
        menuBar.toggle(e);
    }

    toggleMenuMobile() {
        this.header.setMenuAside(!this.menuMobileOpen)
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
