import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { Professor, Professor_NivelApostila, ProfessorCreateRequest, ProfessorEditRequest } from '../models/professor.model';
import { Map } from '../utils/map';

@Injectable({
    providedIn: 'root',

})
export class ProfessorService {
    url = '';
    list = new BehaviorSubject<Professor[]>([]);

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
    ) {
        this.url = environment.url + 'back';
    }


    getNivelAbaco() {
        return this.http.get<Professor_NivelApostila[]>(`${this.url}/professor/nivel/abaco/all`)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar nível ábaco', life: 3000 });
                }
            }));
    }
    
    getNivelAH() {
        return this.http.get<Professor_NivelApostila[]>(`${this.url}/professor/nivel/ah/all`)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar nível AH', life: 3000 });
                }
            }));
    }

    getList() {
        return this.http.get<Professor[]>(`${this.url}/professor/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar professores', life: 3000 });
                }
            }));
    }

    get(id: number) {
        return new Observable<Professor>((observer => {
            var item = this.list.value.find(x => x.id == id) as Professor;
            item.dataInicio = new Date(item.dataInicio);

            if (item)
                observer.next(item);
            else
                observer.error('Professor não encontrado.')
            observer.complete();
            return;
        }))
        // return this.http.get<Professor>(`${this.url}/professor/${id}`)
        //     .pipe(tap({
        //         error: err => {
        //             this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar aluno', life: 3000 });
        //         }
        //     }));
    }

    create(model: Professor) {
        var request = Map(model, new ProfessorCreateRequest);
        return this.http.post<Response>(`${this.url}/professor`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar professor', life: 3000 });
                }
            }));
    }

    edit(model: Professor) {
        var request = Map(model, new ProfessorCreateRequest);
        return this.http.put<Response>(`${this.url}/professor`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível editar professor', life: 3000 });
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/professor/${id}/${activated}`, {})
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível habilitar/desabilitar professor', life: 3000 });
                }
            }));
    }


}
