import { Component, HostListener } from '@angular/core';
import { MobileService } from './utils';
import { balloons, textBalloons } from "balloons-js";

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

    async balloon() {

        balloons()

        // await textBalloons([
        //     {
        //         text: '(',color: 'var(--p-primary-500)', fontSize: 80
        //     },
        //     // {
        //     //     text: 'paranbéeens',color: 'blue', fontSize: 16
        //     // },
        //     // {
        //     //     text: 'paranbéeens',color: 'grey', fontSize: 16
        //     // },
        //     // {
        //     //     text: 'paranbéeens',color: 'yellow', fontSize: 16
        //     // },
        //     // {
        //     //     text: 'paranbéeens',color: 'purple', fontSize: 16
        //     // },
        //     // {
        //     //     text: 'paranbéeens',color: 'green', fontSize: 16
        //     // },
        //     // {
        //     //     text: 'paranbéeens',color: 'orange', fontSize: 16
        //     // },
        // ])
    }
}
