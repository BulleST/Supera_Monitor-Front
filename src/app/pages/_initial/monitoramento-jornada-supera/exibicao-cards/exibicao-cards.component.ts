import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChecklistService } from '../../../../services/checklist.service';
import { Checklist } from '../../../../models/checklist.model';

@Component({
    selector: 'app-exibicao-cards',
    standalone: false,
    templateUrl: './exibicao-cards.component.html',
    styleUrl: './exibicao-cards.component.css'
})
export class ExibicaoCardsComponent implements OnChanges {
    @Input() checklists!: Checklist[];
    @Input() loading: boolean = true;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }
    }

}
