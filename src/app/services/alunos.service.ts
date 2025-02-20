import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { AlunoRequest, Aluno, Pessoa_Sexo, Pessoa_Status } from '../models/alunos.model';
import moment from 'moment';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';
import { ReposicaoRequest } from '../models/reposicao.model';

@Injectable({
    providedIn: 'root',

})
export class AlunoService extends Service {
    override list = new BehaviorSubject<Aluno[]>([]);

    getList() {
        return this.http.get<Aluno[]>(`${this.url}/alunos/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error('Não foi possível carregar alunos')
                }
            }));
    }

    getFoto(id: number): Observable<string> {

        var list = this.list.value;
        var index = list.findIndex(x => x.id == id);
        return this.http.get<Response>(`${this.url}/alunos/image/${id}`)
            .pipe(map(
                res => {
                    if (index != -1) {
                        var aluno = list[index];
                        if (aluno) {
                            aluno.aluno_Foto = res.object ?? '';
                            list.splice(index, 1, aluno);
                            this.list.next(list);
                        }
                    }
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
                this.toastrService.error('Aluno não encontrado.');
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
                    this.toastrService.error('Não foi possível cadastrar aluno')
                }
            }));
    }

    edit(model: Aluno) {
        var request = Map(model, new AlunoRequest);

        console.log(request)
        return this.http.put<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error('Não foi possível editar aluno')
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/alunos/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error('Não foi possível habilitar/desabilitar aluno')
                }
            }));
    }

    reposicao(request: ReposicaoRequest) {
        return this.http.post<Response>(`${this.url}/alunos/reposicao/`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error('Não foi possível marcar reposição')
                }
            }));
    }

    getStatus() {
        return this.http.get<Pessoa_Status[]>(`${this.url}/pessoas/status/all`)
            .pipe(tap({
                
                error: err => this.toastrService.error( 'Não foi possível carregar status')
            }));
    }

    getSexo() {
        return this.http.get<Pessoa_Sexo[]>(`${this.url}/pessoas/sexos/all`)
            .pipe(tap({
                error: err => this.toastrService.error( 'Não foi possível carregar sexo')
            }));
    }
}
