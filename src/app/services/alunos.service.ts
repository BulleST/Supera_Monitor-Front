import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { AlunoRequest, Aluno, Pessoa_Sexo, Pessoa_Status } from '../models/alunos.model';
import moment from 'moment';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';
import { ReposicaoAlunoRequest } from '../models/reposicao.model';
import { Aluno_Restricao } from '../models/aluno-restricao.model';
import { checklists } from '../models/checklist.model';
import { getError } from '../utils';

@Injectable({
    providedIn: 'root',

})
export class AlunoService extends Service {
    override list = new BehaviorSubject<Aluno[]>([]);

    getRestricoes() {
        return this.http.get<Aluno_Restricao[]>(`${this.url}/alunos/restricao/all/`)
    }

    getList() {
        // return this.http.get<Aluno[]>(`${this.url}/alunos/all/`)
        return this.http.get<Aluno[]>(`${this.url}/alunos/all/with-checklist`)
            .pipe(tap({
                next: list => {
                    var semana = [ "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", ]
                    list = list.map(aluno => {
                            aluno.turmaDesc = semana[aluno.diaSemana] + ' às ' + aluno.horario.toString().replace(':', 'h').substring(0,5)
                        // aluno.checklist = [];
                        // aluno.checklist = checklists;
                        // aluno.checklist = aluno.checklist.map(checklist => {
                        //     checklist.items = checklist.items.map(item => {
                        //         // item.finalizado = Boolean(Math.ceil(Math.random()));
                        //         return JSON.parse(JSON.stringify(item));
                        //     });
                        //     // checklist.status = checklist.items.find(x => !x.finalizado) ? 'Atrasado' : 'Finalizado';
                        //     return checklist;
                        // });
                        return aluno;
                    })
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar alunos. \n ${getError(err)}`)
                }
            }));
    }

    getFoto(id: number): Observable<string> {

        var list = this.list.value;
        var index = list.findIndex(x => x.id == id);
        return this.http.get<Response>(`${this.url}/alunos/image/${id}`)
        // var randomImgUrl=`https://picsum.photos/id/${Math.round(Math.random() * 1000)}/200/200.jpg`;

        //     return this.http.get<string>(randomImgUrl)
            .pipe(map(
                res => {
                    if (index != -1) {
                        var aluno = list[index];
                        if (aluno) {
                            // aluno.aluno_Foto = res;
                            aluno.aluno_Foto = res.object ?? '';
                            list.splice(index, 1, aluno);
                            this.list.next(list);
                        }
                    }
                    // return res;
                    return res.object;
                },
            ), tap({
                error: res => {
                    return of('');
                }
            }));
    }

    get(id: number) {
        return new Promise<Aluno>(async (resolve, reject) => {
            if (this.list.value.length == 0) {
                await lastValueFrom(this.getList());
            }
            
            var item = this.list.value.find(x => x.id == id) as Aluno;
            if (!item) {
                this.toastrService.error(`Aluno não encontrado.'. `);
                return reject('Aluno não encontrado.')
            }

            if (item.dataNascimento)
                item.dataNascimento = new Date(moment(item.dataNascimento).format('YYYY-MM-DD[T]HH:mm:ss'))
            if (item.created)
                item.created = new Date(moment(item.created).format('YYYY-MM-DD[T]HH:mm:ss'))
            if (item.lastUpdated)
                item.lastUpdated = new Date(moment(item.lastUpdated).format('YYYY-MM-DD[T]HH:mm:ss'))
            if (item.deactivated)
                item.deactivated = new Date(moment(item.deactivated).format('YYYY-MM-DD[T]HH:mm:ss'))

            return resolve(item);
        })
    }

    create(model: Aluno) {
        var request = Map(model, new AlunoRequest);
        return this.http.post<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar aluno. \n ${getError(err)}`)
                }
            }));
    }

    edit(model: Aluno) {
        var request = Map(model, new AlunoRequest);

        return this.http.put<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar aluno. \n ${getError(err)}`)
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/alunos/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar aluno. \n ${getError(err)}`)
                }
            }));
    }

    reposicao(request: ReposicaoAlunoRequest) {
        return this.http.post<Response>(`${this.url}/alunos/reposicao/`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível marcar reposição. \n ${getError(err)}`)
                }
            }));
    }

    getStatus() {
        return this.http.get<Pessoa_Status[]>(`${this.url}/pessoas/status/all`)
            .pipe(tap({
                
                error: err => this.toastrService.error(`Não foi possível carregar status. \n ${getError(err)}`)
            }));
    }

    getSexo() {
        return this.http.get<Pessoa_Sexo[]>(`${this.url}/pessoas/sexos/all`)
            .pipe(tap({
                error: err => this.toastrService.error(`Não foi possível carregar sexo. \n ${getError(err)}`)
            }));
    }
}
