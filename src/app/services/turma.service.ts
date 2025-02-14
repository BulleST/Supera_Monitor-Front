import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { TurmaRequest, Turma, Turma_Tipo } from '../models/turma.model';
import moment from 'moment';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';

@Injectable({
    providedIn: 'root',

})
export class TurmaService extends Service {
    override list = new BehaviorSubject<Turma[]>([]);

    getTipos() {
        return this.http.get<Turma_Tipo[]>(`${this.url}/turmas/types/`)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar tipos da turma', life: 3000 });
                }
            }));
    }

    getList() {
        return this.http.get<Turma[]>(`${this.url}/turmas/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar turmas', life: 3000 });
                }
            }));
    }

    get(id: number) {
        return new Promise<Turma>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                await lastValueFrom(this.getList());

            var item = this.list.value.find(x => x.id == id) as Turma;
            if (!item)
                reject('Turma não encontrada.')

            return resolve(item);
        })
    }

    create(model: Turma) {
        var request = Map(model, new TurmaRequest);
        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        return this.http.post<Response>(`${this.url}/turmas`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar turma', life: 3000 });
                }
            }));
    }

    edit(model: Turma) {
        var request = Map(model, new TurmaRequest);
        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        return this.http.put<Response>(`${this.url}/turmas`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível editar turma', life: 3000 });
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/turmas/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível habilitar/desabilitar turma', life: 3000 });
                }
            }));
    }


}
