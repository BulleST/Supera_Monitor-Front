import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, of, Subject, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';
import { Aluno_CheckList_Item, Checklist } from '../models/checklist.model';
import { RequestResponse } from '../helpers/request-response.interface';
import { Aluno } from '../models/alunos.model';

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
            next: res => {
                this.list.next(res);
                this.listSubject.next(res);
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar checklist. \n ${getError(err)}`);
            }
        }));
    }

    getChecklistAula(aula_Id: number) {
        return this.http.get<{ aluno_Id: number, checklist: Aluno_CheckList_Item[] }[]>(`${this.url}/checklist/all/aula/${aula_Id}`).pipe(tap({
            next: res => {
                res.map(aluno => {
                    aluno.checklist.map(checklist => {
                        checklist.finalizado = !!checklist.dataFinalizacao;
                        return checklist;
                    })
                    return aluno;
                })
                return of(res);
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar checklist dos alunos. \n ${getError(err)}`);
            }
        }));
    }

    getChecklistAluno(aluno_Id: number) {
        return this.http.get<Aluno_CheckList_Item[]>(`${this.url}/checklist/all/aluno/${aluno_Id}`).pipe(tap({
            next: res => {
                res.map(x => {
                    x.finalizado = !!x.dataFinalizacao;
                    return x;
                });
                return res;
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar checklist do aluno. \n ${getError(err)}`);
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
