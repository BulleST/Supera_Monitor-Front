import { Component, HostListener } from '@angular/core';
import { MobileService } from './utils';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false,
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
