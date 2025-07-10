import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Checklist, Checklist_Item } from '../../../../models/checklist.model';

@Component({
    selector: 'app-checklist-component',
    standalone: false,
    templateUrl: './checklist.component.html',
    styleUrl: './checklist.component.css'
})
export class ChecklistComponent implements OnChanges {

    @Input() checklist!: Checklist;
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

    trackByChecklistItemId(index: number, item: Checklist_Item) {
        return item.id;
    }
}
