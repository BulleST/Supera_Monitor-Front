import { Component, OnDestroy } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { JornadaSupera_Card_Checklist, JornadaSupera_Request } from '../../models/jornada-supera-cards.model';
import { JornadaSuperaService } from '../../services/jornada-supera.service';
import { JornadaSupera_List_Aluno } from '../../models/jornada-supera-list.model';

@Component({
  selector: 'app-jornada-supera',
  standalone: false,
  templateUrl: './jornada-supera.component.html',
  styleUrl: './jornada-supera.component.css',
  providers: [ConfirmationService],
})
export class JornadaSuperaComponent implements OnDestroy {

    subscription: Subscription[] = [];
    request = new JornadaSupera_Request;
    exibicao = false;

    list: JornadaSupera_List_Aluno[] = [];
    loadingList = false;
    
    cards: JornadaSupera_Card_Checklist[] = [];
    loadingCards = false;

    constructor(
        private service: JornadaSuperaService,
    ) {

        let list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);

        let cards = this.service.cards.subscribe(res => this.cards = res);
        this.subscription.push(cards);

        let exibicao = this.service.exibicao.subscribe(res => this.exibicao = res);
        this.subscription.push(exibicao);

        var onReload = this.service.onReload.subscribe(res => {
            this.request = res ?? this.service.getRequest().value;
            this.update();
        });
        this.subscription.push(onReload);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    update() {
        this.getCard();
        this.getList();
    }


    getCard() {
        this.loadingCards = true;
        lastValueFrom(this.service.getCard(this.request))
            .then(res => this.loadingCards = false)
            .catch(res => this.loadingCards = false);
    }

    getList() {
        this.loadingList = true;
        lastValueFrom(this.service.getList(this.request))
            .then(res => this.loadingList = false)
            .catch(res => this.loadingList = false);
    }
}
