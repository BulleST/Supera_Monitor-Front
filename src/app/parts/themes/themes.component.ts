import { AfterRenderPhase, Component, Injector, ViewChild, afterNextRender, inject } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../utils/theme';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css'
})
export class ThemesComponent {
    selectedTheme: any;
    darkMode = false;
    themeGroups: any[] = [
        {
            label: 'Arya',
            image: 'arya-theme.png',
            hasSwitchMode: false,
            items: [
                {
                    prefix: 'arya',
                    label: 'Blue',
                    color: 'blue',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'arya',
                    label: 'Green',
                    color: 'green',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'arya',
                    label: 'Orange',
                    color: 'orange',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'arya',
                    label: 'Purple',
                    color: 'purple',
                    hasSwitchMode: false,
                },
            ]
        },
        {
            label: 'Aura',
            image: 'aura-theme.png',
            hasSwitchMode: true,
            items: [
                {
                    prefix: 'aura',
                    label: 'Amber',
                    color: 'amber',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Cyan',
                    color: 'cyan',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Green',
                    color: 'green',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Indigo',
                    color: 'indigo',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Lime',
                    color: 'lime',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Noir',
                    color: 'noir',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Pink',
                    color: 'pink',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Purple',
                    color: 'purple',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'aura',
                    label: 'Teal',
                    color: 'teal',
                    hasSwitchMode: true,
                },
            ]
        },
        {
            label: 'Bootstrap 4',
            image: 'bootstrap-theme.png',
            hasSwitchMode: true,
            items: [

                {
                    prefix: 'bootstrap4',
                    label: 'Blue',
                    color: 'blue',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'bootstrap4',
                    label: 'Purple',
                    color: 'purple',
                    hasSwitchMode: true,
                },
            ]
        },
        {
            label: 'Fluent',
            image: 'aura-theme.png',
            hasSwitchMode: false,
            items: [
                {
                    label: 'Fluent',
                    color: 'fluent-light',
                    hasSwitchMode: false,
                },
            ]
        },
        {
            label: 'Lara',
            image: 'lara-theme.png',
            hasSwitchMode: true,
            items: [
                {
                    prefix: 'lara',
                    label: 'Amber',
                    color: 'amber',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Blue',
                    color: 'blue',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Cyan',
                    color: 'cyan',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Green',
                    color: 'green',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Indigo',
                    color: 'indigo',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Pink',
                    color: 'pink',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Purple',
                    color: 'purple',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'lara',
                    label: 'Teal',
                    color: 'teal',
                    hasSwitchMode: true,
                },
            ]
        },
        {
            label: 'Luna',
            image: 'luna-theme.png',
            hasSwitchMode: false,
            items: [
                {
                    prefix: 'luna',
                    label: 'Amber',
                    color: 'amber',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'luna',
                    label: 'Blue',
                    color: 'blue',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'luna',
                    label: 'Green',
                    color: 'green',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'luna',
                    label: 'Pink',
                    color: 'pink',
                    hasSwitchMode: false,
                },]
        },
        {
            label: 'Material Design',
            image: 'md-theme.svg',
            hasSwitchMode: true,
            items: [
                {
                    prefix: 'md',
                    label: 'Deeppurple',
                    color: 'deeppurple',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'md',
                    label: 'Indigo',
                    color: 'indigo',
                    hasSwitchMode: true,
                },
            ]
        },
        {
            label: 'Material Design Condensed',
            image: 'md-theme.svg',
            hasSwitchMode: true,
            items: [
                {
                    prefix: 'mdc',
                    label: 'Deeppurple',
                    color: 'deeppurple',
                    hasSwitchMode: true,
                },
                {
                    prefix: 'mdc',
                    label: 'Indigo',
                    color: 'indigo',
                    hasSwitchMode: true,
                },
            ]
        },
        {
            label: 'Mira',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    label: 'Mira',
                    color: 'mira',
                    hasSwitchMode: false,
                },]
        },
        {
            label: 'Nano',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    label: 'Nano',
                    color: 'nano',
                    hasSwitchMode: false,
                },]
        },
        {
            label: 'Nova',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    label: 'Nova',
                    color: 'nova',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'nova',
                    label: 'Accent',
                    color: 'accent',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'nova',
                    label: 'Alt',
                    color: 'alt',
                    hasSwitchMode: false,
                },]
        },
        {
            label: 'Rhea',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    label: 'Rhea',
                    color: 'rhea',
                    hasSwitchMode: false,
                },
            ]
        },
        {
            label: 'Saga',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    prefix: 'saga',
                    label: 'Blue',
                    color: 'blue',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'saga',
                    label: 'Green',
                    color: 'green',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'saga',
                    label: 'Orange',
                    color: 'orange',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'saga',
                    label: 'Purple',
                    color: 'purple',
                    hasSwitchMode: false,
                },]
        },
        {
            label: 'Soho',
            image: 'md-theme.svg',
            hasSwitchMode: true,
            items: [
                {
                    prefix: 'soho',
                    label: 'Soho',
                    hasSwitchMode: true,
                },]
        },

        {
            label: 'Tailwind',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    label: 'Tailwind',
                    color: 'tailwind-light',
                    hasSwitchMode: false,
                },]
        },

        {
            label: 'Vela',
            image: 'md-theme.svg',
            hasSwitchMode: false,
            items: [
                {
                    prefix: 'vela',
                    label: 'Blue',
                    color: 'blue',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'vela',
                    label: 'Green',
                    color: 'green',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'vela',
                    label: 'Orange',
                    color: 'orange',
                    hasSwitchMode: false,
                },
                {
                    prefix: 'vela',
                    label: 'Purple',
                    color: 'purple',
                    hasSwitchMode: false,
                },]
        },
        {
            label: 'Viva',
            image: 'md-theme.svg',
            hasSwitchMode: true,
            items: [
                {
                    label: 'Viva',
                    prefix: 'viva',
                    hasSwitchMode: true,
                },
            ]
        },


    ]

    open: boolean = true;
    subscription: Subscription[] = [];
    loading = false;
    selectedNode: any;
    @ViewChild('sidebar') sidebar!: Sidebar;
    @ViewChild('cm') cm!: ContextMenu;
    injector = inject(Injector);


    constructor(
        private theme: ThemeService,
    ) {
        afterNextRender(() =>
            this.themeSubscribers(),
            { injector: this.injector, phase: AfterRenderPhase.Read }
        );

        this.open = this.theme.open.value;
        var open = this.theme.open.subscribe(res => {
            this.open = res;
        });
        this.subscription.push(open);
        
        
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    themeSubscribers(): void {
        this.theme.selectedTheme.subscribe(res => {
            this.selectedTheme = res;
            if (res) {
                this.changeTheme(res, this.darkMode);
            }
        });
        
        this.theme.darkMode.subscribe(res => {
            this.darkMode = res;
            if (this.selectedTheme) {
                this.changeTheme(this.selectedTheme, res);
            }
        })
    }

    closeCallback(e: any): void {
        this.sidebar.close(e);
    }

    changeThemeMode() {
        this.darkMode = !this.darkMode;
        this.theme.darkMode.next(this.darkMode)
    }
    
    themeClick(theme: any) {
        this.selectedTheme = theme;
        this.theme.selectedTheme.next(theme);
    }

    
    changeTheme(theme: any, darkMode: boolean){
        localStorage.setItem('theme', JSON.stringify(theme));
        localStorage.setItem('themeMode', JSON.stringify(darkMode));

        var mode: string = darkMode ? 'dark' : 'light'
        var themeArray: string[] = [];

        if ( theme.prefix) {
            themeArray.push(theme.prefix);
        }
        
        if ( theme.hasSwitchMode) {
            themeArray.push(mode);
        }
        if ( theme.color) {
            themeArray.push(theme.color);
        }

        this.theme.switchTheme(themeArray.join('-'));
    }





}
