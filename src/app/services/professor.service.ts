import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { Professor } from '../models/professor.model';

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
            var item = this.list.value.find(x => x.id == id);
            if (item) {
                observer.next(item);
            }
            else {
                observer.error('Professor não encontrado.')
            }
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

    create(request: Professor) {
        return this.http.post<Response>(`${this.url}/professor`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar professor', life: 3000 });
                }
            }));
    }

    edit(request: Professor) {
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
