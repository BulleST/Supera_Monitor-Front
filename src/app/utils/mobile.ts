import { HostListener, Injectable, Injector, afterNextRender, inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import $ from 'jquery';
// declare var $:any 

@Injectable({
    providedIn: 'root'
})
export class MobileService {

    value: BehaviorSubject<ScreenWidth> = new BehaviorSubject<ScreenWidth>(ScreenWidth.lg);
    injector = inject(Injector);

    constructor() {
        this.set();
    }
    @HostListener('window:resize', ['$event'])
    set() {
        try {
            var width: number = $(window).width() ?? 0;
            if (width < 768) {
                this.value.next(ScreenWidth.sm)
            } else if (width < 992) {
                this.value.next(ScreenWidth.md)
            } else if (width < 1200) {
                this.value.next(ScreenWidth.lg)
            } else {
                this.value.next(ScreenWidth.xl)
            }
        } catch (e) {
        }
    }

    get() {
        return this.value;
    }
}


export enum ScreenWidth {
    sm = 'sm',
    md = 'md',
    lg = 'lg',
    xl = 'xl'
}
