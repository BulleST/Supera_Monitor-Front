import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Checklist } from '../../../models/checklist.model';
import { JornadaSupera_Card_Checklist } from '../../../models/jornada-supera-cards.model';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { ChecklistService } from '../../../services/checklist.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-exibicao-cards',
    standalone: false,
    templateUrl: './exibicao-cards.component.html',
    styleUrl: './exibicao-cards.component.css',
})
export class ExibicaoCardsComponent implements OnDestroy {
    
    cards: JornadaSupera_Card_Checklist[] = []
    loading: boolean = false;
    
    subscription: Subscription[] = [];
    exibicao: boolean = true;

    constructor(
        private service: JornadaSuperaService,
    ) {
        let loading = this.service.loadingCards.subscribe(res => this.loading = res);
        this.subscription.push(loading);

        let cards = this.service.cards.subscribe(res => this.cards = res);
        this.subscription.push(cards);

        let exibicao = this.service.getExibicao().subscribe(res => this.exibicao = res);
        this.subscription.push(exibicao);

    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    trackByChecklistId(index: number, item: JornadaSupera_Card_Checklist) {
        return item.id;
    }
}
