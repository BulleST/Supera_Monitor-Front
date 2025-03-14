import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';
import { Aluno_CheckList_Item, Checklist } from '../models/checklist.model';
import { Aluno } from '../models/alunos.model';
import { Response } from '../helpers/request-response.interface';

@Injectable({
    providedIn: 'root',

})
export class ChecklistService extends Service {
    override list = new BehaviorSubject<Checklist[]>([]);
    
    getList() {
        return this.http.get<Checklist[]>(`${this.url}/checklist/all/`).pipe(tap({
            next: res => {
                this.list.next(res);
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
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar checklist do aluno. \n ${getError(err)}`);
            }
        }));
    }

    // getList() {
    //     return this.http.get<Turma[]>(`${this.url}/turmas/all/`)
    //         .pipe(tap({
    //             next: list => {
    //                 list.map(x => {
    //                     x.perfilCognitivoString = x.perfilCognitivo.map(x => x.nome).join(', ');
    //                     x.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + x.horario);
    //                     return x;
    //                 })

    //                 this.list.next(list);
    //                 return of(list);
    //             },
    //             error: err => {
    //                 this.toastrService.error(`Não foi possível carregar turmas. \n ${getError(err)}`);
    //             }
    //         }));
    // }

    // get(id: number) {
    //     return new Promise<Turma>(async (resolve, reject) => {
    //         if (this.list.value.length == 0)
    //             await lastValueFrom(this.getList());

    //         var item = this.list.value.find(x => x.id == id) as Turma;
    //         if (!item) {
    //             this.toastrService.error(`Turma não encontrada.`);
    //            return reject('Turma não encontrada.')
    //         }

    //         return resolve(item);
    //     })
    // }

    markAsDone(id: number) {
        return this.http.patch<Response>(`${this.url}/checklist/toggle-item/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível finalizar checklist. \n ${getError(err)}`);
                }
            }));
    }

    // edit(model: Turma) {
    //     // model.perfilCognitivo = model.perfilCognitivo.map(x => x.id) as any;
    //     var request = Map(model, new TurmaRequest);
    //     request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
    //     return this.http.put<Response>(`${this.url}/turmas`, request)
    //         .pipe(tap({
    //             error: err => {
    //                 this.toastrService.error(`Não foi possível editar turma. \n ${getError(err)}`);
    //             }
    //         }));
    // }

    // deactivated(id: number, activated: boolean = true) {
    //     return this.http.patch<Response>(`${this.url}/turmas/toggle-active/${id}`, {})
    //         .pipe(tap({
    //             error: err => {
    //                 this.toastrService.error(`Não foi possível habilitar/desabilitar turma. \n ${getError(err)}`);
    //             }
    //         }));
    // }


}
