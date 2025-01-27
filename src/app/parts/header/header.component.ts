import { Component, OnDestroy, ViewChild } from '@angular/core';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';
import { ThemeService } from '../../utils/theme';
import { Menubar } from 'primeng/menubar';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { Role } from '../../models/account-perfil.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnDestroy {
  faRegularBell = faBell;
  faChevronDown = faChevronDown;
  items: MenuItem[] = [];
  darkMode = false;
  headerItem: MenuItem[] = [];
  subscription: Subscription[] = [];
  account?: Account;
  Role: typeof Role = Role;
  accountName = '';
  accountAbreviacao = '';
  @ViewChild('menuBig') menuBig?: Menubar;


  profileModalOpen: boolean = false;
  changePasswordModalOpen: boolean = false;

  // injector = inject(Injector);


  constructor (
    private header: Header,
    private theme: ThemeService,
    private accountService: AccountService,
  ) {

    var account = this.accountService.account.subscribe(account => {
      this.account = account;
      var array = account?.name.split(' ') as string[];
      this.accountName = array[ 0 ] ?? '';
      this.accountAbreviacao = array[ 0 ][ 0 ].toUpperCase();

      if (array.length > 1)
        this.accountAbreviacao += array[ array.length - 1 ][ 0 ].toUpperCase();

      this.setMenuItems();
    });
    this.subscription.push(account);

    this.headerItem = [
      {
        label: this.account?.email,
        icon: 'fa fa-envelope',
        disabled: true,
      },
      {
        label: 'Profile',
        icon: 'fa fa-user',
        command: (e) => {
          this.accountService.profileModalOpen.emit(true);
        }
      },
      {
        label: 'Logout',
        icon: 'fa fa-power-off',
        command: () => {
          this.accountService.logout();
        }
      },

    ];

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

  setMenuItems() {
    this.items = [];

    if (this.account) {
      this.items.push({
        label: 'Basic',
        items: [ {
          label: 'Class',
          routerLink: 'class'
        }, {
          label: 'Company',
          routerLink: 'companies'
        }, {
          label: 'Funds/Entities',
          items: [
            {
              label: 'Funds/Entities',
              routerLink: 'fund'
            },
            {
              label: 'Family',
              routerLink: 'fund/family'
            },
            {
              label: 'Product',
              routerLink: 'fund/product'
            },
            {
              label: 'Cash Account Types',
              routerLink: 'fund/cash-account/type'
            }
          ]
          }, {
            label: 'Group',
            routerLink: 'groups',
          }
        ]
      });



      this.items.push({
        label: 'Market Data',
        items: [
          {
            label: 'Calculation Base',
            items: [
              { label: 'Calculation Base Manager' },
              { label: 'Mapping' },
            ]
          },
          { label: 'Calendar' },
          { label: 'Country' },
          {
            label: 'Currency',
            items: [
              { label: 'Manager' },
              { label: 'Mapping (Dominant Currency)' },
            ]
          },
          { label: 'Exchange' },
          {
            label: 'Frequency',
            items: [
              { label: 'Manager', routerLink: 'frequency' },
              { label: 'Mapping' },
            ]
          },
          {
            label: 'Index',
            items: [
              { label: 'Manager' },
              { label: 'Mapping' },
            ]
          },
          {
            label: 'Product Manager',
            items: [
              { label: 'Equity' },
              { label: 'Equity Option' },
              { label: 'Fixed Income / CDS / CDX' },
              { label: 'Future' },
              { label: 'Future Option' },
            ]
          },
          {
            label: 'Rates',
            items: [
              {
                label: 'Fixing', items: [
                  { label: 'Fixing Rate Value' },
                  { label: 'Fixing Source Manager' },
                  { label: 'Mapping' },
                ]
              },
              { label: 'FX' },
            ]
          },
          {
            label: 'Commissions & Fees',
            items: [
              { label: 'Execution Commission' },
              { label: 'Clearing Commission' },
              { label: 'Fees' },
            ]
          },
        ]
      });



      var setup: MenuItem = {
        label: 'Setup',
        items: []
      }
      if (this.account.role_Id == Role.Admin) {

        setup.items!.push({
          label: 'Customer',
          routerLink: 'customers',
        });

      }
      setup.items!.push({
        label: 'User',
        routerLink: 'users',
      });
      this.items.push(setup);
    }

  }
}
