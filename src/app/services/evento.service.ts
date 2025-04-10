import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject,  lastValueFrom,  of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { Service } from '../helpers/service.service';
import { Evento, EventoReagendamentoRequest, EventoTipo } from '../models/evento.model';
import { EventoAulaExtraRequest, EventoAulaRequest } from '../models/evento-aula.model';
import { EventoSuperacaoRequest } from '../models/evento-superacao.model';
import { EventoOficinaRequest } from '../models/evento-oficina.model';
import { EventoReuniaoRequest } from '../models/evento-reuniao.model';
import { EventoAula0Request } from '../models/evento-aula-0.model';
import { Evento_Mes } from '../models/evento-aula-aluno.model';
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


@Injectable({
    providedIn: 'root',
})
export class EventoService extends Service {
    
    eventos = new BehaviorSubject<Evento[]>([]);
    evento = new BehaviorSubject<Evento | undefined>(undefined);
    // evento = new EventEmitter<Evento>();
    calendarioReload = new EventEmitter<number>();
    calendarView = new BehaviorSubject<CalendarioView>(CalendarioView.Geral);
    roteiros: Roteiro[] = [];

    constructor(
        http: HttpClient,
        toastr: ToastrService,
        private roteiroService: RoteiroService
    ) {
        super(http, toastr);

        this.roteiroService.list.subscribe(res => this.roteiros = res);

        if (roteiroService.list.value.length == 0) 
            lastValueFrom(roteiroService.getList())
    }

    setEvento(value: Evento | undefined) {
        this.evento.next(value)
        if (value) localStorage.setItem('evento', JSON.stringify(value))
        else localStorage.removeItem('evento');
    }

    get(id: number) {
        return this.http.get<Evento>(`${this.url}/eventos/${id}`)
    }

    getOficinas() {
        return this.http.get<Evento[]>(`${this.url}/eventos/oficinas/`)
        .pipe(tap({
            next: async eventos => {
                if (this.roteiroService.list.value.length == 0) 
                    await lastValueFrom(this.roteiroService.getList())

                var eventosExistentes = this.eventos.value as Evento[];
                eventos = eventos.map(evento => {
                    evento.data = new Date(evento.data as any);
                    evento.active = !evento.deactivated;
                    evento.professores = evento.professores ?? [];
                    evento.alunos = evento.alunos ?? [];
                    evento.alunos.forEach(aluno => aluno.active = !aluno.deactivated );
                    evento.alunos = evento.alunos.filter(aluno => !aluno.deactivated)

                    evento.professor_Id = evento.professor_Id ?? (evento.professores.length) ? evento.professores[0].id : undefined;
                    evento.professor = evento.professor ?? (evento.professores.length) ? evento.professores[0].nome : undefined;

                    if (!evento.roteiro_Id || evento.roteiro_Id == PseudoEvento.EventoId) {
                        var roteiro = this.roteiros.find(x => moment(evento.data).isBetween(x.dataInicio, x.dataFim));
                        if (roteiro) evento.roteiro_Id = roteiro.id;
                    }

                    var index = eventosExistentes.findIndex(x => x.turma_Id == evento.turma_Id && moment(x.data).isSame(evento.data));
                    if (index == -1) eventosExistentes.push(evento);
                    else eventosExistentes.splice(index, 1, evento);
                    return evento;
                });

                this.eventos.next(eventosExistentes);
                return of(eventos);
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(err)}`);
            }
        }));
    }
  
    calendario(request: CalendarioRequest) {
        return this.http.post<Evento[]>(`${this.url}/eventos/calendario/`, request)
            .pipe(tap({
                next: async eventos => {
                    if (this.roteiroService.list.value.length == 0) 
                        await lastValueFrom(this.roteiroService.getList())
    
                    var eventosExistentes = this.eventos.value as Evento[];
                    eventos = eventos.map(evento => {
                        evento.data = moment(evento.data, 'YYYY-MM-DDTHH:mm').toDate(),
                        evento.active = !evento.deactivated;
                        evento.professores = evento.professores ?? [];
                        evento.alunos = evento.alunos ?? [];
                        evento.alunos.forEach(aluno => aluno.active = !aluno.deactivated );
                        evento.alunos = evento.alunos.filter(aluno => !aluno.deactivated)

                        if (!evento.professor_Id && evento.professores.length > 0) {
                            evento.professor_Id = evento.professores[0].professor_Id;
                            evento.professor = evento.professores[0].nome;
                        }
    
                        if (!evento.roteiro_Id || evento.roteiro_Id == PseudoEvento.EventoId) {
                            var roteiro = this.roteiros.find(x => moment(evento.data).isBetween(x.dataInicio, x.dataFim));
                            if (roteiro) evento.roteiro_Id = roteiro.id;
                        }
    
                        var index = eventosExistentes.findIndex(x => x.turma_Id == evento.turma_Id && moment(x.data).isSame(evento.data));
                        if (index == -1) eventosExistentes.push(evento);
                        else eventosExistentes.splice(index, 1, evento);
                        return evento;
                    });
    
                    this.eventos.next(eventosExistentes);
                    return of(eventos);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(err)}`);
                }
            }));
    }
    
    createAulaTurma(model: EventoAulaRequest ) {
        // var request = MyMap(model, new EventoAulaRequest);
        return this.http.post<Response>(`${this.url}/eventos/aulas/turma`, model)
    }
    
    editAulaTurma(model: EventoAulaRequest ) {
        // var request = MyMap(model, new EventoAulaRequest);
        return this.http.put<Response>(`${this.url}/eventos/aulas`, model)
    }
  
    createAula0(model: EventoAula0Request ) {
        // var request = MyMap(model, new EventoAula0Request);
        return this.http.post<Response>(`${this.url}/eventos/aulas/zero`, model)
    }
    editAula0(model: EventoAula0Request ) {
        // var request = MyMap(model, new EventoAula0Request);
        return this.http.put<Response>(`${this.url}/eventos/aulas`, model)
    }
  
    createAulaExtra(model: EventoAulaExtraRequest ) {
        // var request = MyMap(model, new EventoAulaExtraRequest);
        return this.http.post<Response>(`${this.url}/eventos/aulas/extra`, model)
    }
    editAulaExtra(model: EventoAulaExtraRequest ) {
        // var request = MyMap(model, new EventoAulaExtraRequest);
        return this.http.put<Response>(`${this.url}/eventos/aulas`, model)
    }

    createSuperacao(model: EventoSuperacaoRequest ) {
        // var request = MyMap(model, new EventoSuperacaoRequest);
        return this.http.post<Response>(`${this.url}/eventos/superacao`, model)
    }
    editSuperacao(model: EventoSuperacaoRequest ) {
        // var request = MyMap(model, new EventoSuperacaoRequest);
        return this.http.put<Response>(`${this.url}/eventos/superacao`, model)
    }
    createOficina(model: EventoOficinaRequest ) {
        // var request = MyMap(model, new EventoOficinaRequest);
        return this.http.post<Response>(`${this.url}/eventos/oficinas`, model)
    }
    editOficina(model: EventoOficinaRequest ) {
        // var request = MyMap(model, new EventoOficinaRequest);
        return this.http.put<Response>(`${this.url}/eventos/oficinas`, model)
    }
    createReuniao(model: EventoReuniaoRequest ) {
        // var request = MyMap(model, new EventoReuniaoRequest);
        return this.http.post<Response>(`${this.url}/eventos/reunioes`, model)
    }
    editReuniao(model: EventoReuniaoRequest ) {
        // var request = MyMap(model, new EventoReuniaoRequest);
        return this.http.put<Response>(`${this.url}/eventos/reunioes`, model)
    }

    cancelarEvento(id: number) {
        return this.http.post<Response>(`${this.url}/eventos/cancelar/${id}`, {})
    }
    
    getAlunoAulas(ano: number) {
        return this.http.get<Evento_Mes[]>(`${this.url}/eventos/aulas/alunos/${ano}`)
    }

    inscrever(aluno_Id: number, evento_Id: number) {
        var request = { aluno_Id, evento_Id };
        return this.http.post<Response>(`${this.url}/eventos/inscrever`, request);
    }

    reagendar(request: EventoReagendamentoRequest) {
        return this.http.post<Response>(`${this.url}/eventos/reagendar`, request);
    }
    
    finalizar(request: EventoChamadaRequest) {
        return this.http.post<Response>(`${this.url}/eventos/finalizar`, request);
    }
    
    oficinasFuturas() {
        return this.http.get<Response>(`${this.url}/eventos/oficinas/all`);
    }

}
