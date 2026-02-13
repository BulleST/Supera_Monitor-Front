import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { Service } from '../helpers/service.service';
import { Aluno_Restricao, Aluno_Restricao_Request } from '../models/aluno-restricao.model';
import { getError, insert, insertOrReplace, replace } from '../utils';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',

})
export class AlunoRestricaoService extends Service {
    override list = new BehaviorSubject<Aluno_Restricao[]>([]);
    restricaoCreated = new EventEmitter<Aluno_Restricao>();

    getList(aluno_Id: number) {
        return this.http.get<Aluno_Restricao[]>(`${this.url}/restricoes/all/${aluno_Id}`)
            .pipe(map(list => {
                list.map(item => {
                    item.active = !item.deactivated;
                    return item
                });
                list = list.sort(sortBy('descricao'))
                return list;
            }))
    }

    create(model: Aluno_Restricao_Request) {
        return this.http.post<RequestResponse>(`${this.url}/restricoes/`, model)
            .pipe(tap({
                next: (res: RequestResponse) => {
                    insert(this, res.object, 'list', ['descricao']);
                    this.restricaoCreated.emit(res.object);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar restrição. \n ${getError(err)}`)
                }
            }));
    }

    toggle(id: number) {
        return this.http.patch<RequestResponse>(`${this.url}/restricoes/toggle-active/${id}`, {})
            .pipe(tap({
                next: (res: RequestResponse) => {
                    replace(this, res.object, 'list', ['descricao']);
                    this.restricaoCreated.emit(res.object);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar restrição. \n ${getError(err)}`)
                }
            }));
    }

}
