import { Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { EventoService } from '../../../../../services/evento.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Aluno } from '../../../../../models/alunos.model';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import moment from 'moment';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { Feriado } from '../../../../../models/feriado.model';
import { ConfirmationService } from 'primeng/api';
import { AlunoService } from '../../../../../services/alunos.service';

@Component({
    selector: 'app-reposicao-de-select',
    standalone: false,
    templateUrl: './reposicao-de-select.component.html',
    styleUrl: '../agendar-reposicao.component.css',
    providers: [ConfirmationService]
})
export class ReposicaoDeSelectComponent implements OnDestroy {
    evento?: Evento;
    list: Evento[] = [];
    loading = false;
    readonly = false;
    subscription: Subscription[] = [];
    data = new Date;

    aluno?: Aluno;
    @Input() eventoReposicaoPara?: Evento;
    @Output() onEventoChanged = new EventEmitter<Evento>();
    @Output() onVisibleChange = new EventEmitter<boolean>();

    SalaAndar = SalaAndar;

    feriados: Feriado[] = [];
    loadingFeriados = false;

    constructor(
        private service: EventoService,
        private activatedRoute: ActivatedRoute,
        private toastr: ToastrService,
        private alunoService: AlunoService,

    ) {
        let onVisibleChange = this.onVisibleChange.subscribe(res => {
            if (!res) {
                this.ngOnDestroy();
            }
        })
        this.subscription.push(onVisibleChange);


		let eventoReposicaoPara = this.service.getEventoReposicaoPara().subscribe(res => this.eventoReposicaoPara = res);
		this.subscription.push(eventoReposicaoPara);

        let eventoReposicaoDe = this.service.getEventoReposicaoDe().subscribe(res => {
            
            let params = this.activatedRoute.snapshot.queryParamMap;

            var idParam = params.get('evento_reposicao_de');

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
        this.subscription.push(eventoReposicaoDe);

		let aluno = this.alunoService.getAluno().subscribe(res => {
            this.aluno = res;
            if (!this.readonly) {
                this.loadEventosReposicaoDe();
                this.setEvento();
            }
		});
        this.subscription.push(aluno);
        let feriados = this.service.feriados.subscribe(res => this.feriados = res);
        this.subscription.push(feriados);
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
        if (changes['eventoReposicaoPara']) this.eventoReposicaoPara = changes['eventoReposicaoPara'].currentValue;

        this.loadEventosReposicaoDe();
        this.setEvento();
    }

    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    setEvento() {
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
        this.onEventoChanged.emit(this.evento);
        this.service.setEventoReposicaoDe(this.evento)
    }

    loadEventosReposicaoDe() {
        if (!this.aluno) {
            return;
        }
        else {
            this.data = this.data ?? new Date;
            let request: CalendarioRequest = {
                aluno_Id: this.aluno?.id,
                intervaloDe: moment(this.data).startOf('month').toDate(),
                intervaloAte: moment(this.data).endOf('month').toDate(),
            }
            if (this.eventoReposicaoPara) {
                this.data = this.eventoReposicaoPara.data;
                request.intervaloDe = moment(this.data).subtract(1, 'month').toDate();
                request.intervaloAte = moment(this.data).add(1, 'month').toDate();
            }
    
    
            this.loading = true;
            return lastValueFrom(this.service.getList(request))
                .then(res => {
                    this.list = res.eventos.filter(aula => {
                        const alunoEstaNaAula = aula.alunos.find(x => x.aluno_Id == this.aluno!.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const naoMarcouReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoPara_Evento_Id;
                        const naoEhReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoDe_Evento_Id;
                        const naoGanhouPresenca = alunoEstaNaAula && alunoEstaNaAula.presente !== true;
    
                        return alunoEstaNaAula
                            && ehAula
                            && naoMarcouReposicao
                            && naoEhReposicao
                            && naoGanhouPresenca
                    });
    
                    this.list = this.list.sort((x, y) => y.data.getTime() - x.data.getTime())
                    this.loading = false;
                    this.setEvento();
                })
                .catch(res => {
                    this.loading = true;
                    this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                    console.error(res)
                });
        }
    }

}
