import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { EventoService } from '../../../../../services/evento.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Aluno } from '../../../../../models/alunos.model';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import moment from 'moment';
import { PseudoEvento } from '../../../../../models/reposicao.model';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { AlunoService } from '../../../../../services/alunos.service';
import { sortBy } from 'sort-by-typescript';
import { provideImgixLoader } from '@angular/common';

@Component({
    selector: 'app-reposicao-para-select',
    standalone: false,
    templateUrl: './reposicao-para-select.component.html',
    styleUrl: '../agendar-reposicao.component.css',
})
export class ReposicaoParaSelectComponent implements OnDestroy {
    evento?: Evento;
    list: Evento[] = [];
    loading = false;
    readonly = false;
    subscription: Subscription[] = [];
    data = new Date;

    aluno?: Aluno;
    eventoReposicaoDe?: Evento;
    @Output() onEventoChanged = new EventEmitter<Evento>();
    @Output() onVisibleChange = new EventEmitter<boolean>();

    SalaAndar = SalaAndar;
    maxDate?: Date = undefined;

    constructor(
        private activatedRoute: ActivatedRoute,
        private toastr: ToastrService,
        private service: EventoService,
        private alunoService: AlunoService,

    ) {
        let onVisibleChange = this.onVisibleChange.subscribe(res => {
            if (!res) {
                this.ngOnDestroy();
            }
        })
        this.subscription.push(onVisibleChange);

        let aluno = this.alunoService.getAluno().subscribe(res => {
            this.aluno = res;
            this.loadEventosReposicaoPara();
            this.setEvento();
        });
        this.subscription.push(aluno);

        let eventoReposicaoDe = this.service.getEventoReposicaoDe().subscribe(res => {
            if (res) {
                this.maxDate = moment(res.data).add(1, 'month').toDate();
            }
            this.eventoReposicaoDe = res;
            this.loadEventosReposicaoPara();
            this.setEvento();
        });
        this.subscription.push(eventoReposicaoDe);

        let eventoReposicaoPara = this.service.getEventoReposicaoPara().subscribe(res => {
            
            let params = this.activatedRoute.snapshot.queryParamMap;

            var idParam = params.get('evento_reposicao_para');

            this.readonly = idParam != null && idParam != 'null';

            this.evento = res;

            if (this.evento) {
                this.data = moment(this.evento?.data ?? new Date).toDate();
                if (this.readonly) {
                    this.list = [this.evento];
                }
            }

            this.setEvento();
        });
        this.subscription.push(eventoReposicaoPara);
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    loadEventosReposicaoPara() {
        console.log('loadEventosReposicaoPara')
        console.log('aluno', this.aluno)
        console.log('eventoReposicaoDe', this.eventoReposicaoDe)
        console.log('data', this.data)
        console.log('maxDate', this.maxDate)
        if (!this.aluno) {
            return undefined;
        }
        else if (!this.eventoReposicaoDe) {
            return undefined;
        }
        else {
            let request: CalendarioRequest = {
                perfil_Cognitivo_Id: this.aluno.perfilCognitivo_Id,
                intervaloDe: moment(this.data).toDate(),
                intervaloAte: moment(this.data).add(1, 'month').toDate(),
            }
            console.log('request', request)


            this.loading = true;
            return lastValueFrom(this.service.getList(request))
                .then(res => {

                    this.list = res.eventos.filter(aula => {
                        console.groupCollapsed(moment(aula.data).format('DD/MM HH:mm'), aula)
                        const aulaAtiva = aula.active;
                        const aulaNaoFinalizada = !aula.finalizado;
                        const aulaTemVagas = aula.alunosAtivosEvento < aula.capacidadeMaximaEvento;
                        const alunoNaoEstaNaAula = !aula.alunos.find(x => x.aluno_Id == this.aluno!.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const perfilCognitivo = aula.perfilCognitivo.map(x => x.id).includes(this.aluno!.perfilCognitivo_Id);
                        const ehPerfilCognitivoCompativel = !this.aluno?.perfilCognitivo_Id || perfilCognitivo;
                        const naoEhFeriado = !aula.feriado;
                        const salaValida = !this.aluno?.restricaoMobilidade || (this.aluno.restricaoMobilidade && aula.andar == SalaAndar.Terreo)
                        const mesmaAula = this.eventoReposicaoDe!.id == aula.id && ![aula.id].includes(PseudoEvento.EventoId);
                        const mesmaDataHora = moment(this.eventoReposicaoDe!.data).isSame(aula.data);

                        const result = 
                            aulaAtiva
                            && aulaNaoFinalizada
                            && aulaTemVagas
                            && alunoNaoEstaNaAula
                            && ehAula
                            && ehPerfilCognitivoCompativel
                            && naoEhFeriado
                            && salaValida
                            && !mesmaAula
                            && !mesmaDataHora;
                        console.log('result', result);
                        console.groupEnd();
                        return result;
                    });

                    this.list = this.list.sort(sortBy('data'))
                    console.log('list', this.list);
                    this.setEvento();
                    this.loading = false;
                })
                .catch(res => {
                    this.loading = true;
                    this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                    console.error(res)
                });
        }
    }

    setEvento() {
        console.log('setEvento');
        console.log('evento', this.evento);
        console.log('list', this.list);
        if (this.evento && this.list) {
            let index = this.list.findIndex(x => x.id == this.evento!.id
                && moment(this.evento!.data).isSame(x.data)
                && this.evento!.turma_Id == x.turma_Id
            );
            if (index != -1) {
                this.evento = this.list[index];
            }
        }
    }

    eventoChanged() {
        if (this.evento && this.aluno) {
            this.selectEventoReposicaoPara()
        }
    }

    selectEventoReposicaoPara() {
        if (this.evento) {
            this.evento = this.evento;
            this.service.setEventoReposicaoPara(this.evento)
            this.onEventoChanged.emit(this.evento);
        }
    }
}
