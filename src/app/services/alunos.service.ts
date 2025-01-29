import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { Alunos, Alunos_List } from '../models/alunos.model';

@Injectable({
    providedIn: 'root',

})
export class AlunoService {
    url = '';
    list = new BehaviorSubject<Alunos_List[]>([]);

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
    ) {
        this.url = environment.url + 'back';
    }


    getList() {
        return this.http.get<Alunos_List[]>(`${this.url}/alunos/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar alunos', life: 3000 });
                }
            }));
    }

    get(id: number) {
        return this.http.get<Alunos>(`${this.url}/alunos/${id}`)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar aluno', life: 3000 });
                }
            }));
    }

    create(request: Alunos) {
        return this.http.post<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar aluno', life: 3000 });
                }
            }));
    }

    edit(request: Alunos) {
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
