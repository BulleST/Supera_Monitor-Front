import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Checklist } from '../../../../models/checklist.model';

@Component({
    selector: 'app-exibicao-cards',
    standalone: false,
    templateUrl: './exibicao-cards.component.html',
    styleUrl: './exibicao-cards.component.css',
})
export class ExibicaoCardsComponent implements OnChanges {
    @Input() checklists!: Checklist[];
    @Input() loading: boolean = true;
    @Input() loadingChecklists: boolean = true;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
        }
        if (changes['loadingAlunos']) {
            this.loading = changes['loadingAlunos'].currentValue;
            console.log('exibicao-list loadingAlunos', this.loading)
        }
        if (changes['loadingChecklists']) {
            this.loadingChecklists = changes['loadingChecklists'].currentValue;
            console.log('exibicao-list loadingChecklists', this.loadingChecklists)
        }
    }
    
    trackByChecklistId(index: number, item: Checklist) {
        return item.id;
    }


}
