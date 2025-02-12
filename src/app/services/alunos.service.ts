import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { AlunoRequest, Aluno, Pessoa_Sexo, Pessoa_FaixaEtaria, Pessoa_Geracao, Pessoa_Status } from '../models/alunos.model';
import moment from 'moment';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';
import { Reposicao, ReposicaoRequest } from '../models/reposicao.model';

@Injectable({
    providedIn: 'root',

})
export class AlunoService extends Service {
    override list = new BehaviorSubject<Aluno[]>([]);

    getGeracao() {
        return this.http.get<Pessoa_Geracao[]>(`${this.url}/pessoas/geracoes/all`)
            .pipe(tap({
                error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar geração', life: 3000 })
            }));
    }

    // getOrigem() {
    //     return this.http.get<Pessoa_Origem[]>(`${this.url}/pessoas/faixa-etaria/all`)
    //         .pipe(tap({
    //             error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar sexo', life: 3000 })
    //         }));
    // }


    // getOrigemCanal() {
    //     return this.http.get<Pessoa_Origem_Canal[]>(`${this.url}/pessoas/faixa-etaria/all`)
    //         .pipe(tap({
    //             error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar sexo', life: 3000 })
    //         }));
    // }


    // getOrigemCategoria() {
    //     return this.http.get<Pessoa_Origem_Categoria[]>(`${this.url}/pessoas/faixa-etaria/all`)
    //         .pipe(tap({
    //             error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar sexo', life: 3000 })
    //         }));
    // }


    getStatus() {
        return this.http.get<Pessoa_Status[]>(`${this.url}/pessoas/status/all`)
            .pipe(tap({
                error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar status', life: 3000 })
            }));
    }


    getSexo() {
        return this.http.get<Pessoa_Sexo[]>(`${this.url}/pessoas/sexos/all`)
            .pipe(tap({
                error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar sexo', life: 3000 })
            }));
    }

    getFaixaEtaria() {
        return this.http.get<Pessoa_FaixaEtaria[]>(`${this.url}/pessoas/faixas-etarias/all`)
            .pipe(tap({
                error: err => this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar faixa etária', life: 3000 })
            }));
    }


    getList() {
        return this.http.get<Aluno[]>(`${this.url}/alunos/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar alunos', life: 3000 });
                }
            }));
    }

    getFoto(id: number): Observable<string> {
        return this.http.get<Response>(`${this.url}/alunos/image/${id}`)
        .pipe(map(
            res => {
                return res.object;
            }, 
        ), tap({
            error: res => {
                return of('');
            }
        }));
    }

    get(id: number) {
        return new Observable<Aluno>((observer => {
            var item = this.list.value.find(x => x.id == id) as Aluno;
           
            if(item.dataCadastro)
                item.dataCadastro = new Date(moment(item.dataCadastro).format('YYYY-MM-DD[T]HH:mm:ss'))
            if(item.dataNascimento)
                item.dataNascimento = new Date(moment(item.dataNascimento).format('YYYY-MM-DD[T]HH:mm:ss'))
            if(item.dataEntrada)
                item.dataEntrada = new Date(moment(item.dataEntrada).format('YYYY-MM-DD[T]HH:mm:ss'))
            if(item.created)
                item.created = new Date(moment(item.created).format('YYYY-MM-DD[T]HH:mm:ss'))
            if(item.lastUpdated)
                item.lastUpdated = new Date(moment(item.lastUpdated).format('YYYY-MM-DD[T]HH:mm:ss'))
            if(item.deactivated)
                item.deactivated = new Date(moment(item.deactivated).format('YYYY-MM-DD[T]HH:mm:ss'))
            
            if (item)
                observer.next(item);
            else
                observer.error('Aluno não encontrado.')

            observer.complete();
            return;
        }))
    }

    create(model: Aluno) {
        var request = Map(model, new AlunoRequest);
        return this.http.post<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar aluno', life: 3000 });
                }
            }));
    }


    edit(model: Aluno) {
        var request = Map(model, new AlunoRequest);

        return this.http.put<Response>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível editar aluno', life: 3000 });
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/alunos/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível habilitar/desabilitar aluno', life: 3000 });
                }
            }));
    }

    reposicao(request: ReposicaoRequest) {
        return this.http.post<Response>(`${this.url}/alunos/reposicao/`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível marcar reposição', life: 3000 });
                }
            }));
    }


}
