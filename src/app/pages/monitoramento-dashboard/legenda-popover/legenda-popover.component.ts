import { Component, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-legenda-popover',
  standalone: false,
  templateUrl: './legenda-popover.component.html',
  styleUrl: './legenda-popover.component.css'
})
export class LegendaPopoverComponent {
    
    @ViewChild('popover') popover!: Popover;
    
    show(e: any) {
        this.popover.show(e);
    }

    hide() {
        this.popover.hide();
    }
}
