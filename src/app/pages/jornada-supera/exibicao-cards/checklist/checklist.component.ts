import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { JornadaSupera_Card_Checklist, JornadaSupera_Card_Checklist_Item } from '../../../../models/jornada-supera-cards.model';

@Component({
    selector: 'app-checklist-component',
    standalone: false,
    templateUrl: './checklist.component.html',
    styleUrl: './checklist.component.css'
})
export class ChecklistComponent implements OnChanges {

    @Input() checklist!: JornadaSupera_Card_Checklist;
    @Input() loading: boolean = true;
    @Input() loadingChecklists: boolean = true;
    activeIndex = 0;


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklist']) {
            this.checklist = changes['checklist'].currentValue;
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }
        if (changes['loadingChecklists']) {
            this.loadingChecklists = changes['loadingChecklists'].currentValue;
        }
    }

    trackByChecklistItemId(index: number, item: JornadaSupera_Card_Checklist_Item) {
        return item.id;
    }
}
