import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, Observable, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { AlunoRequest, Aluno, Pessoa_Sexo, Pessoa_Status } from '../models/alunos.model';
import moment from 'moment';
import { MyMap } from '../utils/map';
import { Service } from '../helpers/service.service';
import { ReposicaoAlunoRequest } from '../models/reposicao.model';
import { Aluno_Restricao, Aluno_Restricao_Request } from '../models/aluno-restricao.model';
import { getError } from '../utils';
import { ChecklistService } from './checklist.service';
import { Checklist } from '../models/checklist.model';
import { CalendarioAlunoChecklistView } from '../models/calendario.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Aluno_Historico } from '../models/aluno-historico.model';

@Injectable({
    providedIn: 'root',

})
export class AlunoService extends Service {

    override list = new BehaviorSubject<Aluno[]>([]);
    checklists: Checklist[] = [];
    restricaoCreated = new EventEmitter<Aluno_Restricao>();

    constructor(
        private checklistService: ChecklistService,
        http: HttpClient,
        toastrService:ToastrService,

    ) {
        super(http, toastrService);

        lastValueFrom(this.checklistService.getList())
            .then(res => this.checklists = res);

        checklistService.list.subscribe(res => {
            this.checklists = res;
        })

    }
    
    getList() {
        return this.http.get<Aluno[]>(`${this.url}/alunos/all`)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível carregar alunos. \n ${getError(err)}`)
                }
            }));
    }

    getListWithChecklist() {
        return this.http.get<Aluno[]>(`${this.url}/alunos/all/with-checklist`)
            .pipe(tap({
                next: list => {
                    var semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",]
                    list = list.map(aluno => {
                        aluno.active = !aluno.deactivated;

                        aluno.created = moment(aluno.created).toDate();
                        aluno.dataInicioVigencia = moment(aluno.dataInicioVigencia).toDate();
                        aluno.dataNascimento = moment(aluno.dataNascimento).toDate();
                        // Nuláveis
                        aluno.lastUpdated = aluno.lastUpdated ? moment(aluno.lastUpdated).toDate() : undefined;
                        aluno.deactivated = aluno.deactivated ? moment(aluno.deactivated).toDate() : undefined;
                        aluno.dataFimVigencia = aluno.dataFimVigencia ? moment(aluno.dataFimVigencia).toDate() : undefined;


                        aluno.turmaDesc = semana[aluno.diaSemana] + ' às ' + aluno.horario.toString().replace(':', 'h').substring(0, 5)
                        aluno.alunoChecklist = aluno.alunoChecklist.map(checklistAluno => {
                            checklistAluno.finalizado = !!checklistAluno.dataFinalizacao;
                            return checklistAluno
                        })
                        aluno.checklistCompleto = this.checklists
                            .map(checklist => {
                                var hoje = new Date();

                                var checklistAluno = new CalendarioAlunoChecklistView;
                                checklistAluno.id = checklist.id;
                                checklistAluno.nome = checklist.nome;
                                checklistAluno.items = aluno.alunoChecklist.filter(x => x.checklist_Id == checklist.id);
                                checklistAluno.prazo = checklistAluno.items[0]?.prazo ?? undefined;
                                checklistAluno.finalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                                checklistAluno.atrasados = checklistAluno.items.filter((x: any) => !x.finalizado && moment(x.prazo).week() < moment(new Date).week());
                                checklistAluno.pendentesDaSemana = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                                return checklistAluno;
                            });
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

    getHistorico(id: number) {
        return this.http.get<Aluno_Historico[]>(`${this.url}/alunos/historico/${id}`)
        .pipe(map((res: any) => {
            return res.map((x: any) => {
                x.account_Created == x.account.name;
                return x
            })
        }))
    }


    getResumo(id: number) {
        return this.http.get<any[]>(`${this.url}/alunos/resumo/${id}`)
    }

    getFoto(id: number): Observable<string> {

        var list = this.list.value;
        var index = list.findIndex(x => x.id == id);
        return this.http.get<RequestResponse>(`${this.url}/alunos/image/${id}`)
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
                await lastValueFrom(this.getListWithChecklist());
            }

            var item = this.list.value.find(x => x.id == id) as Aluno;
            if (!item) {
                this.toastrService.error(`Aluno não encontrado.'. `);
                return reject('Aluno não encontrado.')
            }

            return resolve(item);
        })
    }

    create(model: Aluno) {
        var request = MyMap(model, new AlunoRequest);
        return this.http.post<RequestResponse>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar aluno. \n ${getError(err)}`)
                }
            }));
    }

    edit(model: Aluno) {
        var request = MyMap(model, new AlunoRequest);
        return this.http.put<RequestResponse>(`${this.url}/alunos`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar aluno. \n ${getError(err)}`)
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/alunos/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar aluno. \n ${getError(err)}`)
                }
            }));
    }

    reposicao(request: ReposicaoAlunoRequest) {
        return this.http.post<RequestResponse>(`${this.url}/alunos/reposicao/`, request)
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
