import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { TurmaRequest, Turma } from '../models/turma.model';
import moment from 'moment';
import { MyMap } from '../utils/map';
import { Service } from '../helpers/service.service';
import { getError, insert, replace } from '../utils';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaPipe } from '../utils/sala-aula.pipe';

@Injectable({
    providedIn: 'root',
})
export class TurmaService extends Service {
    override list = new BehaviorSubject<Turma[]>([]);

    constructor(
        http: HttpClient,
        toastr: ToastrService,
    ) {

        super(http, toastr)
    }

    mapTurma(turma: Turma) {
        let semana = [ "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", ]
        
        turma.active = !turma.deactivated;
        turma.activeString = turma.active ? 'Ativo' : 'Inativo';
        turma.perfilCognitivoString = turma.perfilCognitivo.map(x => x.nome).join(', ');
        turma.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + turma.horario);
        turma.diasDeAulaString = semana[turma.diaSemana] + ' às ' + moment(turma.horario).format('HH[h]mm')
        turma.capacidadeMaximaAlunosString = `${turma.capacidadeMaximaAlunos} alunos`;

        turma.vagas = turma.capacidadeMaximaAlunos - turma.alunosAtivos;
        turma.vagas = turma.vagas < 0 ? 0 : turma.vagas;
        turma.temGrupo = !!turma.linkGrupo;

        return turma;
    }

    getList() {
        return this.http.get<Turma[]>(`${this.url}/turmas/all/`)
            .pipe(tap({
                next: list => {                    
                    list.map(turma => this.mapTurma(turma))
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar turmas. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return this.http.get<Turma>(`${this.url}/turmas/${id}`).pipe(tap({
                next: turma => {                    
                    return of(this.mapTurma(turma));
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar turma. \n ${getError(err)}`);
                }
            }));
    }

    create(model: Turma) {
        let request = MyMap(model, new TurmaRequest);

        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        request.perfilCognitivo = model.perfilCognitivo.map(x => x.id);
        request.linkGrupo = model.linkGrupo;

        return this.http.post<RequestResponse>(`${this.url}/turmas`, request)
            .pipe(tap({
                next: (res) => {
                    if (res.success) {
                        res.object = this.mapTurma(res.object);
                        insert(this, res.object, 'list');
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar turma. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Turma) {
        let request = MyMap(model, new TurmaRequest) as TurmaRequest;
        
        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        request.perfilCognitivo = model.perfilCognitivo.map(x => x.id);
        request.linkGrupo = model.linkGrupo;

        return this.http.put<RequestResponse>(`${this.url}/turmas`, request)
            .pipe(tap({
                next: (res) => {
                    if (res.success) {
                        res.object = this.mapTurma(res.object);
                        replace(this, res.object, 'list');
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível editar turma. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/turmas/toggle-active/${id}`, {})
            .pipe(tap({
                next: (res) => {
                    if (res.success) {
                        res.object = this.mapTurma(res.object);
                        replace(this, res.object, 'list');
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar turma. \n ${getError(err)}`);
                }
            }));
    }


}
