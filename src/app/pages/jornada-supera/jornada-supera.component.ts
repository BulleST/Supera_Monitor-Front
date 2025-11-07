import { Component, OnDestroy } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Aluno_Checklist_Item_View, JornadaSuperaRequest } from '../../models/aluno-checklist-item-list.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../models/alunos.model';
import { Checklist } from '../../models/checklist.model';
import { ChecklistService } from '../../services/checklist.service';
import { AlunoService } from '../../services/alunos.service';
import { AccountService } from '../../services/account.service';
import moment from 'moment';
import { showError } from '../../utils';
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

        // this.service.getExibicao();
        let exibicao = this.service.exibicao.subscribe(res => {
            console.log('exibicao', res);
            this.exibicao = res;
        });
        this.subscription.push(exibicao);

        this.service.onReload.subscribe(res => {
            console.log('onReload', res);
            this.request = res ?? this.service.getRequest().value;
            this.update();
        });

        // this.update();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    update() {
        // this.getChecklis ts();
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
