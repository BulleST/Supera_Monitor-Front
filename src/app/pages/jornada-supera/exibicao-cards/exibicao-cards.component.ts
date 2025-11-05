import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Checklist } from '../../../models/checklist.model';

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

    // true - cards
    // false - lista
    @Input() modoExibicao: boolean = true;
    @Output() modoExibicaoOnChange = new EventEmitter<boolean>();
    @Output() toggleFilterPopover = new EventEmitter<any>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
        }
        if (changes['loadingAlunos']) {
            this.loading = changes['loadingAlunos'].currentValue;
        }
        if (changes['loadingChecklists']) {
            this.loadingChecklists = changes['loadingChecklists'].currentValue;
        }
                if (changes['modoExibicao']) {
                    this.modoExibicao = changes['modoExibicao'].currentValue;
                }
    }

    modoExibicaoChanged() {
        this.modoExibicaoOnChange.emit(this.modoExibicao);
    }

    trackByChecklistId(index: number, item: Checklist) {
        return item.id;
    }


}
