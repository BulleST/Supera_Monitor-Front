import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { EventoService } from '../../../../services/evento.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Aluno } from '../../../../models/alunos.model';
import { CalendarioRequest } from '../../../../models/calendario.model';
import moment from 'moment';
import { SalaAndar } from '../../../../models/sala-aula.model';

@Component({
    selector: 'app-reposicao-de-select',
    standalone: false,
    templateUrl: './reposicao-de-select.component.html',
    styleUrl: '../aluno-reposicao-dialog.component.css',
})
export class ReposicaoDeSelectComponent implements OnChanges, OnDestroy {
    evento?: Evento;
    list: Evento[] = [];
    loading = false;
    readonly = false;
    subscription: Subscription[] = [];

    @Input() aluno?: Aluno;
    @Input() eventoReposicaoPara?: Evento;
    @Output() onEventoChanged = new EventEmitter<Evento>();
    @Output() onVisibleChange = new EventEmitter<boolean>();

    SalaAndar = SalaAndar;

    constructor(
        private service: EventoService,
        private activatedRoute: ActivatedRoute,
        private toastr: ToastrService,

    ) {

        this.onVisibleChange.subscribe(res => {
            if (!res) {
                this.ngOnDestroy();
            }
        })

        let eventoReposicaoDe = this.service.getEventoReposicaoDe().subscribe(res => {
            let params = this.activatedRoute.snapshot.paramMap;
            this.readonly = !!params.get('evento_reposicao_de');
            this.evento = res;
            this.setEvento();
        });
        this.subscription.push(eventoReposicaoDe);
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

            let request: CalendarioRequest = {
                aluno_Id: this.aluno.id,
                intervaloDe: moment().subtract(1, 'month').toDate(),
                intervaloAte: moment().endOf('year').toDate(),
            }


            if (this.eventoReposicaoPara) {
                request.intervaloDe = moment(this.eventoReposicaoPara.data).subtract(1, 'month').toDate();
                request.intervaloAte = moment(this.eventoReposicaoPara.data).subtract(1, 'day').toDate();
            }

            this.loading = true;
            lastValueFrom(this.service.getList(request))
                .then(res => {
                    this.list = res.filter(aula => {
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
