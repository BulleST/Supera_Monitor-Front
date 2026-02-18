import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { Evento, EventoCancelamentoRequest } from '../models/evento.model';
import { EventoTurmaExtraRequest, EventoAulaRequest } from '../models/evento-aula.model';
import { EventoSuperacaoRequest } from '../models/evento-superacao.model';
import { EventoOficinaRequest } from '../models/evento-oficina.model';
import { EventoReuniaoRequest } from '../models/evento-reuniao.model';
import { EventoAula0Request, FinalizarAulaZeroRequest } from '../models/evento-aula-0.model';
import { CalendarioRequest, CalendarioResponse, CalendarioView } from '../models/calendario.model';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getError } from '../utils';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RoteiroService } from './roteiro.service';
import { Roteiro } from '../models/roteiro.model';
import { PrimeiraAulaRequest, ReposicaoRequest } from '../models/reposicao.model';
import { MyMap } from '../utils/map';
import { EventoChamadaRequest } from '../models/evento-chamada.model';
import { UpdateParticipacaoAlunoRequest } from '../models/evento-participacao-aluno.model';
import { EventoAgendarFaltaRequest } from '../models/evento-agendar-falta-request.model';
import { UrlService } from '../utils/url.service';
import { statusContato } from '../models/evento-participacao-aluno.model';
import { RequestResponse } from '../helpers/request-response.interface';
import { FeriadoService } from './feriado.service';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',
})
export class EventoService extends Service {
    evento = new BehaviorSubject<Evento | undefined>(undefined);
    eventoReposicaoDe = new BehaviorSubject<Evento | undefined>(undefined);
    eventoReposicaoPara = new BehaviorSubject<Evento | undefined>(undefined);
    eventos = new BehaviorSubject<Evento[]>([]);
    statusContato = new BehaviorSubject<{ value: any, label: string }[]>(statusContato);

    onReload = new EventEmitter<number>();
    calendarView = new EventEmitter<CalendarioView>();
    roteiros: Roteiro[] = [];

    constructor(
        private roteiroService: RoteiroService,
        private feriadoService: FeriadoService,
        http: HttpClient,
        toastrService: ToastrService,
        urlService: UrlService
    ) {

        super(http, toastrService, urlService);
        this.roteiroService.list.subscribe((res) => (this.roteiros = res));

    }

    getEvento() {
        if (!this.evento.value) {
            let eventoString = localStorage.getItem('evento');
            if (eventoString) {
                let evento = eventoString ? this.mapEvento(JSON.parse(eventoString)) : undefined;
                this.evento.next(evento);
            }
        }
        return this.evento;
    }

    setEvento(value: Evento | undefined) {
        this.evento.next(value);

        if (value) {
            var newValue = {...value}
            newValue.data = moment(newValue.data).format('YYYY-MM-DD[T]HH:mm') as any;
            localStorage.setItem('evento', JSON.stringify(newValue));
        }
        else localStorage.removeItem('evento');
    }

    getEventoReposicaoDe() {
        if (!this.eventoReposicaoDe.value) {
            let eventoString = localStorage.getItem('evento-reposicao-de');
            if (eventoString) {
                let evento = eventoString ? this.mapEvento(JSON.parse(eventoString)) : undefined;
                this.eventoReposicaoDe.next(evento);
            }
        }
        return this.eventoReposicaoDe;
    }

    setEventoReposicaoDe(value: Evento | undefined) {
        this.eventoReposicaoDe.next(value);
        if (value) {
            value.data = moment(value.data).format('YYYY-MM-DD[T]HH:mm') as any;
            localStorage.setItem('evento-reposicao-de', JSON.stringify(value));
        }
        else localStorage.removeItem('evento-reposicao-de');
    }

    getEventoReposicaoPara() {
        if (!this.eventoReposicaoPara.value) {
            let eventoString = localStorage.getItem('evento-reposicao-para');
            if (eventoString) {
                let evento = eventoString ? this.mapEvento(JSON.parse(eventoString)) : undefined;
                this.eventoReposicaoPara.next(evento);
            }
        }
        return this.eventoReposicaoPara;
    }
    setEventoReposicaoPara(value: Evento | undefined) {
        this.eventoReposicaoPara.next(value);
        if (value) {
            value.data = moment(value.data).format('YYYY-MM-DD[T]HH:mm') as any;
            localStorage.setItem('evento-reposicao-para', JSON.stringify(value));
        }
        else localStorage.removeItem('evento-reposicao-para');
    }

    mapEvento(evento: Evento) {
        evento.data = moment(evento.data, 'YYYY-MM-DDTHH:mm').locale('pt-BR').toDate();
        evento.active = !evento.deactivated;

        evento.professores = evento.professores ?? [];
        evento.professores = evento.professores.filter(x => x.active);
        evento.professores = evento.professores.sort((x, y) => (x.nome < y.nome ? -1 : 1));

        evento.alunos = evento.alunos ?? [];
        evento.alunos.sort((x, y) => (x.aluno < y.aluno ? -1 : 1))
        evento.alunos = evento.alunos.map(x => {
            x.active = !x.deactivated;
            x.deactivated = x.deactivated ? moment(x.deactivated).toDate() : undefined;
            x.alunoContactado = x.alunoContactado ? moment(x.alunoContactado).toDate() : undefined;
            x.created = moment(x.created).toDate();
            return x
        })
        return evento;
    }

    getList(request: CalendarioRequest) {
        request.intervaloDe = moment(request.intervaloDe).format('YYYY-MM-DD') as any;
        request.intervaloAte = moment(request.intervaloAte).format('YYYY-MM-DD') as any;

        return this.http.post<CalendarioResponse>(`${this.url}/eventos/calendario/`, request)
            .pipe(tap({ 
                next: res => {
                    let eventos = res.eventos;
                    eventos = eventos.map(evento => {
                        evento = this.mapEvento(evento);
                        return evento;
                    });

                    eventos = eventos.sort(sortBy('data'))
                    this.eventos.next(eventos);

                    let feriados = res.feriados;
                    feriados = feriados.map(feriado => {
                        feriado.data = moment(feriado.data).toDate();
                        feriado.created = moment(feriado.created).toDate();
                        feriado.deactivated = feriado.deactivated ? moment(feriado.deactivated).toDate() : undefined;
                        return feriado;
                    });
                    feriados = feriados.sort(sortBy('data'))

                    this.feriadoService.list.next(feriados)

                    return of(res);
                },
                error: (err) => {
                    this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(err)}`);
                },
            }));
    }

    get(id: number) {
        return this.http.get<Evento>(`${this.url}/eventos/${id}`)
            .pipe(tap(async evento => {
                evento = this.mapEvento(evento);
                evento = await this.loadReposicoes(evento)
                
                return evento;
            }));
    }
        async loadReposicoes(evento: Evento) {
            var reqs: Promise<Evento>[] = [];
            evento.alunos.map(aluno => {
                // if (aluno.reposicaoDe_Evento_Id && !aluno.reposicaoDe_Evento) {
                //    var req = lastValueFrom(this.get(aluno.reposicaoDe_Evento_Id))
                //     .then(res => aluno.reposicaoDe_Evento = res)
                //     reqs.push(req)
                // }
                // if (aluno.reposicaoPara_Evento_Id && !aluno.reposicaoPara_Evento) {
                //     var req = lastValueFrom(this.get(aluno.reposicaoPara_Evento_Id))
                //     .then(res => aluno.reposicaoPara_Evento = res)
                //     reqs.push(req)
                // }
                return aluno;
            })

            await Promise.all(reqs);

            return evento;
        }

    getPseudoAula(turma_Id: number, dataHora: Date) {
        dataHora = moment(dataHora).format('YYYY-MM-DD[T]HH:mm:ss') as any
        return this.http.post<Evento>(`${this.url}/eventos/pseudo-aula`, { turma_Id, dataHora })
            .pipe(tap(evento => {
                evento = this.mapEvento(evento);
                return evento;
            }));
    }
       
    createAulaTurma(model: EventoAulaRequest) {
        let request = MyMap(model, new EventoAulaRequest()) as EventoAulaRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/aulas/turma`, request);
    }

    editAulaTurma(model: EventoAulaRequest) {
        let request = MyMap(model, new EventoAulaRequest()) as EventoAulaRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.put<RequestResponse>(`${this.url}/eventos/aulas`, request);
    }

    createAula0(model: EventoAula0Request) {
        let request = MyMap(model, new EventoAula0Request()) as EventoAula0Request;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/aulas/zero`, request);
    }

    editAula0(model: EventoAula0Request) {
        let request = MyMap(model, new EventoAula0Request()) as EventoAula0Request;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.put<RequestResponse>(`${this.url}/eventos/aulas`, request);
    }

    createAulaExtra(model: EventoTurmaExtraRequest) {
        let request = MyMap(model, new EventoTurmaExtraRequest()) as EventoTurmaExtraRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/aulas/extra`, request);
    }

    editAulaExtra(model: EventoTurmaExtraRequest) {
        let request = MyMap(model, new EventoTurmaExtraRequest()) as EventoTurmaExtraRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.put<RequestResponse>(`${this.url}/eventos/aulas`, request);
    }

    createSuperacao(model: EventoSuperacaoRequest) {
        let request = MyMap(model, new EventoSuperacaoRequest()) as EventoSuperacaoRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/superacao`, request);
    }

    editSuperacao(model: EventoSuperacaoRequest) {
        let request = MyMap(model, new EventoSuperacaoRequest()) as EventoSuperacaoRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.put<RequestResponse>(`${this.url}/eventos/superacao`, request);
    }

    createOficina(model: EventoOficinaRequest) {
        let request = MyMap(model, new EventoOficinaRequest()) as EventoOficinaRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/oficinas`, request);
    }

    editOficina(model: EventoOficinaRequest) {
        let request = MyMap(model, new EventoOficinaRequest()) as EventoOficinaRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.put<RequestResponse>(`${this.url}/eventos/oficinas`, request);
    }

    createReuniao(model: EventoReuniaoRequest) {
        let request = MyMap(model, new EventoReuniaoRequest()) as EventoReuniaoRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/reunioes`, request);
    }

    editReuniao(model: EventoReuniaoRequest) {
        let request = MyMap(model, new EventoReuniaoRequest()) as EventoReuniaoRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.put<RequestResponse>(`${this.url}/eventos/reunioes`, request);
    }

    cancelar(request: EventoCancelamentoRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/cancelar`, request);
    }

    finalizar(request: EventoChamadaRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/finalizar`, request);
    }

    finalizarAulaZero(request: FinalizarAulaZeroRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/aula-zero/finalizar`, request);
    }

    inscrever(aluno_Id: number, evento_Id: number) {
        let request = { aluno_Id, evento_Id };
        return this.http.post<RequestResponse>(`${this.url}/eventos/participacao/inscrever`, request);
    }

    cancelarParticipacao(request: EventoAgendarFaltaRequest) {
        return this.http.patch<RequestResponse>(`${this.url}/eventos/participacao/cancelar`, request);
    }

    atualizarParticipacao(request: UpdateParticipacaoAlunoRequest) {
        return this.http.put<RequestResponse>(`${this.url}/eventos/participacao/atualizar`, request);
    }
    
    primeiraAula(request: PrimeiraAulaRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/primeira-aula`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível marcar primeira aula. \n ${getError(err)}`)
                }
            }));
    }

    reposicao(request: ReposicaoRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/reposicao/`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível marcar reposição. \n ${getError(err)}`)
                }
            }));
    }

}
