import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import 'moment/locale/pt-br';
import { JornadaSupera_Card_Checklist, JornadaSupera_Request } from '../models/jornada-supera-cards.model';
import { JornadaSupera_List_Aluno } from '../models/jornada-supera-list.model';

@Injectable({
    providedIn: 'root',
})
export class JornadaSuperaService extends Service {

    cards = new BehaviorSubject<JornadaSupera_Card_Checklist[]>([]);
    override list = new BehaviorSubject<JornadaSupera_List_Aluno[]>([]);

    onReload = new EventEmitter<JornadaSupera_Request | undefined>();
    loadingCards = new EventEmitter<boolean>();
    loadingList = new EventEmitter<boolean>();
    
    exibicao = new BehaviorSubject<boolean>(true);
    request = new BehaviorSubject<JornadaSupera_Request>(new JornadaSupera_Request);

    getExibicao() {
        let itemString = localStorage.getItem('exibicao');
        let item = itemString === 'true';
        this.exibicao.next(item);
        return this.exibicao;
    }

    setExibicao(value: boolean) {
        console.log()
        this.exibicao.next(value);
        localStorage.setItem('exibicao', JSON.stringify(value));
    }

    getRequest() {
        if (!this.request.value) {
            let itemString = localStorage.getItem('request');
            let item = itemString ? JSON.parse(itemString) : new JornadaSupera_Request;
            this.request.next(item);
        }
        return this.request;
    }

    setRequest(value: JornadaSupera_Request) {
        this.request.next(value);
        localStorage.setItem('request', JSON.stringify(value));
    }

    getCard(request: JornadaSupera_Request = this.getRequest().value) {
        this.loadingCards.emit(true);
        return this.http.post<JornadaSupera_Card_Checklist[]>(`${this.url}/jornada-supera/cards`, request)
            .pipe(tap({
                next: res => {
                    this.loadingCards.emit(false);
                    this.cards.next(res)
                    return res;
                },
                error: res => {
                    this.loadingCards.emit(false);
                }
            }));
    }

    getList(request: JornadaSupera_Request = this.getRequest().value) {
        this.loadingList.emit(true);
        return this.http.post<JornadaSupera_List_Aluno[]>(`${this.url}/jornada-supera/list`, request)
            .pipe(tap({
                next: res => {
                    this.loadingList.emit(false);
                    this.list.next(res)
                    return res;
                },
                error: res => {
                    this.loadingList.emit(false);
                }
            }));
    }

}