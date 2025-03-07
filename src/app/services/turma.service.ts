import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { TurmaRequest, Turma } from '../models/turma.model';
import moment from 'moment';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';

@Injectable({
    providedIn: 'root',

})
export class TurmaService extends Service {
    override list = new BehaviorSubject<Turma[]>([]);

    getList() {
        return this.http.get<Turma[]>(`${this.url}/turmas/all/`)
            .pipe(tap({
                next: list => {
                    list.map(x => {
                        x.perfilCognitivoString = x.perfilCognitivo.map(x => x.nome).join(', ');
                        x.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + x.horario);
                        return x;
                    })

                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar turmas. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return new Promise<Turma>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                await lastValueFrom(this.getList());

            var item = this.list.value.find(x => x.id == id) as Turma;
            if (!item) {
                this.toastrService.error(`Turma não encontrada.`);
               return reject('Turma não encontrada.')
            }

            return resolve(item);
        })
    }

    create(model: Turma) {
        // model.perfilCognitivo = model.perfilCognitivo.map(x => x.id) as any;
        var request = Map(model, new TurmaRequest);
        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        return this.http.post<Response>(`${this.url}/turmas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar turma. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Turma) {
        // model.perfilCognitivo = model.perfilCognitivo.map(x => x.id) as any;
        var request = Map(model, new TurmaRequest);
        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        return this.http.put<Response>(`${this.url}/turmas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar turma. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/turmas/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar turma. \n ${getError(err)}`);
                }
            }));
    }


}
