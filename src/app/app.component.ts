import { Component, HostListener } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MobileService } from './utils';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false,
    providers: [MessageService]
})
export class AppComponent {
    title = 'Supera - PED4U';

    constructor(private mobile: MobileService) {

    }

    @HostListener('window:resize', ['$event'])
    resize() {
        this.mobile.set();
    }
}
