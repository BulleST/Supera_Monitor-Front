import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import 'moment/locale/pt-br';
import { JornadaSupera_Card_Checklist, JornadaSupera_Request } from '../models/jornada-supera-cards.model';
import { JornadaSupera_List_Aluno, JornadaSupera_List_Checklist } from '../models/jornada-supera-list.model';
import { sortBy } from 'sort-by-typescript';

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
                next: list => {
                    this.loadingCards.emit(false);
                    list = list.sort(sortBy('numeroSemana', 'nome'))
                    this.cards.next(list)
                    return list;
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
                next: list => {
                    this.loadingList.emit(false);
                    list = list.sort(sortBy('turma_Id', 'nome'))
                    this.list.next(list)
                    return list;
                },
                error: res => {
                    this.loadingList.emit(false);
                }
            }));
    }

    getJornadaAluno(aluno_Id: number) {
        var request = { aluno_Id: aluno_Id, pendenteSemana: false };
        return this.http.post<JornadaSupera_List_Aluno[]>(`${this.url}/jornada-supera/list`, request)
            .pipe(map(res => {
                let item = res[0];
                item.checklists = item.checklists.sort(sortBy('ordem'))
                this.loadingList.emit(false);
                return item;
            }),
            tap({
                error: res => {
                    this.loadingList.emit(false);
                }
            }))
    }

}