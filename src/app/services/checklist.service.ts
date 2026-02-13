import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, of, Subject, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';
import { Checklist } from '../models/checklist.model';
import { RequestResponse } from '../helpers/request-response.interface';
import { Aluno } from '../models/alunos.model';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',

})
export class ChecklistService extends Service {
    override list = new BehaviorSubject<Checklist[]>([]);
    listSubject = new Subject<Checklist[]>();
    onFinish = new EventEmitter<any>();

    exibicaoLista = new BehaviorSubject<Aluno[]>([])

    
    getList() {
        return this.http.get<Checklist[]>(`${this.url}/checklist/all/`).pipe(tap({
            next: list => {
                list = list.sort(sortBy('ordem'))
                this.list.next(list);
                this.listSubject.next(list);
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar checklist. \n ${getError(err)}`);
            }
        }));
    }

    markAsDone(id: number, observacoes: string = '') {
        var request = {
            aluno_Checklist_Item_Id: id,
            observacoes: observacoes
        }
        return this.http.patch<RequestResponse>(`${this.url}/checklist/toggle-item`, request)
            .pipe(tap({
                next: res => {
                    this.toastrService.success(`Checklist finalizado`, 'Sucesso');
                },
                error: err => {
                    this.toastrService.error(`Não foi possível finalizar item da jornada. \n ${getError(err)}`);
                }
            }));
    }
}
