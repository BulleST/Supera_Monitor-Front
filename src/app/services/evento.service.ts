import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { Service } from '../helpers/service.service';
import { Evento, EventoCancelamentoRequest, EventoReagendamentoRequest, EventoTipo } from '../models/evento.model';
import { EventoTurmaExtraRequest, EventoAulaRequest } from '../models/evento-aula.model';
import { EventoSuperacaoRequest } from '../models/evento-superacao.model';
import { EventoOficinaRequest } from '../models/evento-oficina.model';
import { EventoReuniaoRequest } from '../models/evento-reuniao.model';
import { EventoAula0Request } from '../models/evento-aula-0.model';
import { CalendarioRequest, CalendarioView } from '../models/calendario.model';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getError } from '../utils';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RoteiroService } from './roteiro.service';
import { Roteiro } from '../models/roteiro.model';
import { PseudoEvento } from '../models/reposicao.model';
import { MyMap } from '../utils/map';
import { EventoChamadaRequest } from '../models/evento-chamada.model';
import { Feriado } from '../models/feriado.model';
import { FinalizarAulaZeroRequest } from '../models/evento-aula-0.model';
import { EventoAgendarFaltaRequest } from '../models/evento-agendar-falta-request.model';
import { UrlService } from '../utils/url.service';
import { statusContato } from '../models/evento-participacao-aluno.model';

@Injectable({
    providedIn: 'root',
})
export class EventoService extends Service {
    evento = new BehaviorSubject<Evento | undefined>(undefined);
    eventoReposicaoDe = new BehaviorSubject<Evento | undefined>(undefined);
    eventoReposicaoPara = new BehaviorSubject<Evento | undefined>(undefined);
    eventos = new BehaviorSubject<Evento[]>([]);
    feriados = new BehaviorSubject<Feriado[]>([]);
    statusContato = new BehaviorSubject<{ value: any, label: string }[]>(statusContato);

    calendarioReload = new EventEmitter<number>();
    calendarView = new EventEmitter<CalendarioView>();
    roteiros: Roteiro[] = [];

    constructor(
        private roteiroService: RoteiroService,
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
            let evento = eventoString ? this.mapEvento(JSON.parse(eventoString)) : undefined;
            this.evento.next(evento);
        }
        return this.evento;
    }

    setEvento(value: Evento | undefined) {

        this.evento.next(value);
        if (value) {
            value.data = moment(value.data).format('YYYY-MM-DD[T]HH:mm') as any;
            localStorage.setItem('evento', JSON.stringify(value));
        }
        else localStorage.removeItem('evento-reposicao-de');
    }

    getEventoReposicaoDe() {
        if (!this.eventoReposicaoDe.value) {
            let eventoString = localStorage.getItem('evento-reposicao-de');
            let evento = eventoString ? this.mapEvento(JSON.parse(eventoString)) : undefined;
            this.eventoReposicaoDe.next(evento);
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
            let evento = eventoString ? this.mapEvento(JSON.parse(eventoString)) : undefined;
            this.eventoReposicaoPara.next(evento);
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

        evento.professores = evento.professores.filter(x => x.active) ?? [];
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
        return this.http.post<Evento[]>(`${this.url}/eventos/calendario/`, request)
            .pipe(tap({
                next: async (eventos) => {
                    let list = this.eventos.value as Evento[];
                    eventos = eventos.map(evento => {
                        evento = this.mapEvento(evento);

                        let index = list.findIndex(x => x.id == evento.id
                            && x.turma_Id == evento.turma_Id
                            && moment(x.data).isSame(evento.data));

                        if (index == -1) list.push(evento);
                        else list.splice(index, 1, evento);

                        return evento;
                    });

                    this.eventos.next(list);

                    return of(list);
                },
                error: (err) => {
                    this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(err)}`);
                },
            })
            );
    }

    get(id: number) {
        return this.http.get<Evento>(`${this.url}/eventos/${id}`)
            .pipe(tap(evento => {
                evento = this.mapEvento(evento);
                return evento;
            }));
    }

    getPseudoAula(turma_Id: number, dataHora: Date) {
        dataHora = moment(dataHora).format('YYYY-MM-DD[T]HH:mm:ss') as any
        return this.http.post<Evento>(`${this.url}/eventos/pseudo-aula`, { turma_Id, dataHora })
            .pipe(tap(evento => {
                evento = this.mapEvento(evento);
                return evento;
            }));
    }

    getFeriados(ano: number = new Date().getFullYear()) {
        let token = '19159|Nm1JCRUJeS7kndMrL4WxoGxfalWQvoel';
        token = '20487|fbPtn71wk6mjsGDWRdU8mGECDlNZhyM7';
        return this.http.get<Feriado[]>(`https://api.invertexto.com/v1/holidays/${ano}?token=${token}&state=SP `)
            .pipe(tap({
                next: res => {
                    let list = this.feriados.value;
                    res.forEach(item => {
                        let index = list.findIndex(x => moment(item.date).isSame(x.date));
                        if (index == -1) list.push(item);
                        else list.splice(index, 1, item);
                    });
                    this.feriados.next(list);
                    return of(list);
                },
            }));
    }

    getOficinas() {
        return this.http.get<Evento[]>(`${this.url}/eventos/oficinas/`)
            .pipe(tap({
                next: async eventos => {
                    if (this.roteiroService.list.value.length == 0)
                        await lastValueFrom(this.roteiroService.getList(moment().year()));

                    let eventosExistentes = this.eventos.value as Evento[];
                    eventos = eventos.map(evento => {
                        evento = this.mapEvento(evento);

                        let index = eventosExistentes.findIndex(x => x.turma_Id == evento.turma_Id && moment(x.data).isSame(evento.data));
                        if (index == -1) eventosExistentes.push(evento);
                        else eventosExistentes.splice(index, 1, evento);
                        return evento;
                    });

                    this.eventos.next(eventosExistentes);
                    return of(eventos);
                },
                error: (err) => {
                    this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(err)}`);
                },
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

    inscrever(aluno_Id: number, evento_Id: number) {
        let request = { aluno_Id, evento_Id };
        return this.http.post<RequestResponse>(`${this.url}/eventos/participacao/inscrever`, request);
    }

    reagendar(model: EventoReagendamentoRequest) {
        let request = MyMap(model, new EventoReagendamentoRequest()) as EventoReagendamentoRequest;
        request.data = moment(model.data).format('YYYY-MM-DD[T]HH:mm:ss') as any;
        return this.http.post<RequestResponse>(`${this.url}/eventos/reagendar`, request);
    }

    finalizar(request: EventoChamadaRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/finalizar`, request);
    }

    finalizarAulaZero(request: FinalizarAulaZeroRequest) {
        return this.http.post<RequestResponse>(`${this.url}/eventos/aula-zero/finalizar`, request);
    }

    // cancelarEventos(ano: number) {
    //     return this.http.post<RequestResponse>(`${this.url}/eventos/cancelar-eventos-feriado/${ano}`, {});
    // }

    cancelarParticipacao(request: EventoAgendarFaltaRequest) {
        return this.http.patch<RequestResponse>(`${this.url}/eventos/participacao/cancelar`, request);
    }

    atualizarParticipacao(request: any) {
        return this.http.put<RequestResponse>(`${this.url}/eventos/participacao/atualizar`, request);
    }
}
