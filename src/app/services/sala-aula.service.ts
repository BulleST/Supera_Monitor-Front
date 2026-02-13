import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { Service } from '../helpers/service.service';
import { SalaAula } from '../models/sala-aula.model';
import { MyMap } from '../utils/map';
import { getError } from '../utils';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',
})
export class SalaAulaService extends Service {
    override list = new BehaviorSubject<SalaAula[]>([]);

    getList() {
        return this.http.get<SalaAula[]>(`${this.url}/salas/all/`)
            .pipe(tap({
                next: list => {
                    list = list.sort(sortBy('online', 'andar', 'numeroSala'))
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar salas de aula. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return this.http.get<SalaAula>(`${this.url}/salas/${id}`)
    }

    create(model: SalaAula) {
        // model.perfilCognitivo = model.perfilCognitivo.map(x => x.id) as any;
        var request = MyMap(model, new SalaAula);
        return this.http.post<RequestResponse>(`${this.url}/salas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar sala. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: SalaAula) {
        // model.perfilCognitivo = model.perfilCognitivo.map(x => x.id) as any;
        var request = MyMap(model, new SalaAula);
        return this.http.put<RequestResponse>(`${this.url}/salas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar sala. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/salas/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar sala. \n ${getError(err)}`);
                }
            }));
    }


}
