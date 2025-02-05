import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { aulas, Aulas, Aulas_List, Calendario } from '../models/aulas.model';

@Injectable({
    providedIn: 'root',

})
export class AulaService {
    url = '';
    list = new BehaviorSubject<Calendario[]>([]);

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
    ) {
        this.url = environment.url + 'back';
    }


    getList() {
        // return this.http.get<Aulas_List[]>(`${this.url}/alunos/all/`)
        //     .pipe(tap({
        //         next: list => {
        //             this.list.next(list);
        //             return of(list);
        //         },
        //         error: err => {
        //             this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar alunos', life: 3000 });
        //         }
        //     }));

        return new Observable<Calendario[]>((observer => {
            observer.next(aulas);
            this.list.next(aulas);
            observer.complete();
            return;
        }))
    }

    get(id: number) {
        return new Observable<Aulas_List>((observer => {
            var list = this.list.value.map(x => x.aulas).flat(1);
            var item = list.find(x => x.id == id);
            
            if (item) 
                observer.next(item);
            else 
                observer.error('Aula não encontrada.')
            
            observer.complete();
            return;
        }))
        
    }

    create(request: Aulas) {
        return this.http.post<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar aluno', life: 3000 });
                }
            }));
    }

    edit(request: Aulas) {
        return this.http.put<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível editar aluno', life: 3000 });
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/alunos/${id}/${activated}`, {})
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível habilitar/desabilitar aluno', life: 3000 });
                }
            }));
    }


}
