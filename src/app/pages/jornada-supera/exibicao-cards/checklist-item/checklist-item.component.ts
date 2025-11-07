import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Checklist, Checklist_Item } from '../../../../models/checklist.model';
import { JornadaSupera_Card_Checklist, JornadaSupera_Card_Checklist_Item } from '../../../../models/jornada-supera-cards.model';

@Component({
    selector: 'app-checklist-item',
    standalone: false,
    templateUrl: './checklist-item.component.html',
    styleUrl: './checklist-item.component.css',
})
export class ChecklistItemComponent implements OnChanges {

    @Input() checklist!: JornadaSupera_Card_Checklist;
    @Input() item!: JornadaSupera_Card_Checklist_Item;
    @Input() index!: number;
    @Input() activeIndex!: number;
    @Input() loading: boolean = true;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) {
            this.item = changes['item'].currentValue;
        }
        if (changes['checklist']) {
            this.checklist = changes['checklist'].currentValue;
        }
        if (changes['index']) {
            this.index = changes['index'].currentValue;
        }
        if (changes['activeIndex']) {
            this.activeIndex = changes['activeIndex'].currentValue;
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }
    }
}
