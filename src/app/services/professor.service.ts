import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { Professor, Professor_NivelApostila, ProfessorCreateRequest, ProfessorEditRequest } from '../models/professor.model';
import { Map } from '../utils/map';
import moment from 'moment';
import { Service } from '../helpers/service.service';

@Injectable({
    providedIn: 'root',
})
export class ProfessorService extends Service {
    override list = new BehaviorSubject<Professor[]>([]);

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
        return new Promise<Professor>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                await lastValueFrom(this.getList());

            var item = this.list.value.find(x => x.id == id) as Professor;
            if (!item)
                reject('Professor não encontrado.')

            if (item.dataInicio)
                item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD[T]HH:mm:ss'))

            return resolve(item);
        })
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
        var request = Map(model, new ProfessorEditRequest);
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
