import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
// import { aulas, Aulas, Aulas_List, Calendario } from '../models/aulas.model';
import { CalendarioList, CalendarioRequest } from '../models/calendario.model';
import moment from 'moment';
import { Service } from '../helpers/service.service';
import { AulaCreateRequest } from '../models/aulas.model';

@Injectable({
    providedIn: 'root',

})
export class AulaService extends Service {
    override list = new BehaviorSubject<CalendarioList[]>([]);

    getCalendario(request: CalendarioRequest) {
        return this.http.post<CalendarioList[]>(`${this.url}/aulas/calendario/`, request)
            .pipe(tap({
                next: list => {
                    list.map(x => {
                        x.data = moment(x.data, 'YYYY-MM-DD HH:mm:ss').toDate()
                        return x
                    })
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar alunos', life: 3000 });
                }
            }));
    }

    get(id?: number, data?: Date) {
        return new Observable<CalendarioList>((observer => {
            var item = this.list.value.find(x => x.aula_Id == id && x.data == data);
            if (item) 
                observer.next(item);
            else 
                observer.error('Aula não encontrada.')
            
            observer.complete();
            return;
        }))
    }

    create(request: AulaCreateRequest) {
        return this.http.post<Response>(`${this.url}/aulas`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar aula', life: 3000 });
                }
            }));
    }

    // edit(request: Aulas) {
    //     return this.http.put<Response>(`${this.url}/alunos`, request)
    //         .pipe(tap({
    //             error: err => {
    //                 this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível editar aluno', life: 3000 });
    //             }
    //         }));
    // }

    // deactivated(id: number, activated: boolean = true) {
    //     return this.http.patch<Response>(`${this.url}/alunos/${id}/${activated}`, {})
    //         .pipe(tap({
    //             error: err => {
    //                 this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível habilitar/desabilitar aluno', life: 3000 });
    //             }
    //         }));
    // }


}
