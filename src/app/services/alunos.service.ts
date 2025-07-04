import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, Observable, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { AlunoRequest, Aluno, Pessoa_Sexo, Pessoa_Status } from '../models/alunos.model';
import moment from 'moment';
import { MyMap } from '../utils/map';
import { Service } from '../helpers/service.service';
import { getError, replace } from '../utils';
import { PrimeiraAulaRequest, ReposicaoAlunoRequest } from '../models/reposicao.model';
import { Aluno_Restricao } from '../models/aluno-restricao.model';
import { ChecklistService } from './checklist.service';
import { Checklist } from '../models/checklist.model';
import { AlunoChecklistCompleto } from '../models/calendario.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Aluno_Historico } from '../models/aluno-historico.model';
import { Aluno_Checklist_Item_View, JornadaSuperaRequest } from '../models/aluno-checklist-item-list.model';

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
        toastrService: ToastrService,

    ) {
        super(http, toastrService);


        // lastValueFrom(this.checklistService.getList())
        //     .then(res => this.checklists = res);

        this.checklistService.list.subscribe(res => this.checklists = res);

    }
    mapAluno(aluno: Aluno, where: string) {
        // console.log('mapAluno', where, aluno);
        var semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",]
        aluno.active = !aluno.deactivated;
        aluno.activeString = aluno.active ? 'Ativo' : 'Inativo';

        aluno.created = moment(aluno.created).toDate();
        aluno.dataInicioVigencia = moment(aluno.dataInicioVigencia).toDate();
        aluno.dataNascimento = moment(aluno.dataNascimento).toDate();

        aluno.turma = aluno.turma ?? 'Indefinido';
        aluno.perfilCognitivo = aluno.perfilCognitivo ?? 'Indefinido';
        aluno.kit = aluno.kit ?? 'Indefinido';
        aluno.rm = aluno.rm ?? 'Indefinido';

        // Nuláveis
        aluno.lastUpdated = aluno.lastUpdated ? moment(aluno.lastUpdated).toDate() : undefined;
        aluno.deactivated = aluno.deactivated ? moment(aluno.deactivated).toDate() : undefined;
        aluno.dataFimVigencia = aluno.dataFimVigencia ? moment(aluno.dataFimVigencia).toDate() : undefined;

        if (aluno.diaSemana && aluno.horario) {
            aluno.turmaDesc = semana[aluno.diaSemana] + ' às ' + aluno.horario.toString().replace(':', 'h').substring(0, 5)
        }


        aluno.restricoes = aluno.restricoes ?? [];
        aluno.restricoes = aluno.restricoes.map(item => {
            item.active = !item.deactivated;
            return item;
        })

        aluno.alunoChecklist = aluno.alunoChecklist ?? [];
        aluno.checklistCompleto = aluno.checklistCompleto ?? [];


        if (aluno.alunoChecklist && aluno.alunoChecklist.length) {
            aluno.alunoChecklist = aluno.alunoChecklist.map(checklistAluno => {
                checklistAluno.finalizado = !!checklistAluno.dataFinalizacao;
                return checklistAluno;
            })

            aluno.checklistCompleto = this.checklists
                .map(checklist => {
                    var checklistAluno = new AlunoChecklistCompleto;
                    checklistAluno.id = checklist.id;
                    checklistAluno.nome = checklist.nome;
                    checklistAluno.items = [...aluno.alunoChecklist]
                        .filter(x => x.checklist_Id == checklist.id)
                        .sort((x, y) => x.ordem - y.ordem);
                    checklistAluno.prazo = checklistAluno.items[0].prazo;
                    checklistAluno.itensFinalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                    checklistAluno.itensAtrasados = checklistAluno.items.filter((x: any) => !x.finalizado && moment(x.prazo).week() < moment(new Date).week());
                    checklistAluno.itensEmAndamento = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                    return checklistAluno;
                });
        }

        return aluno;
    }

    getList() {
        return this.http.get<Aluno[]>(`${this.url}/alunos/all`)
            .pipe(tap({
                next: async list => {
                    await list.map(async aluno => {
                        return await this.mapAluno(aluno, 'getList')
                    });
                    this.list.next(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar alunos. \n ${getError(err)}`)
                }
            }));
    }

    getListWithChecklist(request?: JornadaSuperaRequest) {
        request = request ?? new JornadaSuperaRequest
        return this.http.post<Aluno[]>(`${this.url}/alunos/all/with-checklist`, request)
            .pipe(tap({
                next: list => {
                    list = list.map(aluno => this.mapAluno(aluno, 'getListWithChecklist'));
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar alunos. \n ${getError(err)}`)
                }
            }));
    }

    getChecklist(request: JornadaSuperaRequest) {
        return this.http.post<Aluno_Checklist_Item_View[]>(`${this.url}/alunos/checklists/all`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível carregar jornada supera. \n ${getError(err)}`)
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
        return this.http.get<Aluno>(`${this.url}/alunos/${id}`)
            .pipe(tap({
                next: res => {
                    return this.mapAluno(res, 'get');
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar aluno. \n ${getError(err)}`)
                }
            }));
    }

    edit(model: Aluno) {
        var request = MyMap(model, new AlunoRequest) as AlunoRequest;
        request.pessoa_Sexo_Id = model.pessoa_Sexo_Id;
        request.apostila_Kit_Id = model.apostila_Kit_Id;
        request.dataFimVigencia = model.dataFimVigencia;
        request.turma_Id = model.turma_Id;
        request.perfilCognitivo_Id = model.perfilCognitivo_Id;
        request.aluno_Foto = model.aluno_Foto;
        request.aulaZero_Id = model.aulaZero_Id;
        request.primeiraAula_Id = model.primeiraAula_Id;
        return this.http.put<RequestResponse>(`${this.url}/alunos`, request)
            .pipe(tap({
                next: res => {
                    if (res.success) {
                        res.object = this.mapAluno(res.object, 'edit')
                        replace(this, res.object, 'list')
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível editar aluno. \n ${getError(err)}`)
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/alunos/toggle-active/${id}`, {})
            .pipe(tap({
                next: res => {
                    if (res.success) {
                        res.object = this.mapAluno(res.object, 'deactivated')
                        replace(this, res.object, 'list')
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar aluno. \n ${getError(err)}`)
                }
            }));
    }
    
    primeiraAula(request: PrimeiraAulaRequest) {
        return this.http.post<RequestResponse>(`${this.url}/alunos/primeira-aula`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível marcar primeira aula. \n ${getError(err)}`)
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
