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
import { ConfirmationService } from 'primeng/api';
import { Roteiro } from '../../../../models/roteiro.model';
import { SalaAulaPipe } from '../../../../utils/sala-aula.pipe';

@Component({
	selector: 'app-reposicao-de-select',
	standalone: false,
	templateUrl: './reposicao-de-select.component.html',
    styleUrl: '../aluno-reposicao-dialog.component.css',
    providers: [ConfirmationService]
})
export class ReposicaoDeSelectComponent implements OnChanges, OnDestroy {
	evento?: Evento;
	list: Evento[] = [];
	loading = false;
	readonly = false;
	subscription: Subscription[] = [];
	
	@Input() roteiros: Roteiro[] = [];
	@Input() aluno?: Aluno;
	@Input() eventoReposicaoPara?: Evento;
	@Output() onEventoChanged = new EventEmitter<Evento>();

    SalaAndar = SalaAndar;


	constructor(
		private service: EventoService,
		private activatedRoute: ActivatedRoute,
		private toastr: ToastrService,
		private confirmationService: ConfirmationService,
        private salaAulaPipe: SalaAulaPipe,
        
	) {

        let eventoReposicaoDe = this.service.getEventoReposicaoDe().subscribe(res => {
            let params = this.activatedRoute.snapshot.paramMap;
            this.readonly = !!params.get('eventoReposicaoDe');
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
		if (changes['roteiros']) this.roteiros = changes['roteiros'].currentValue;
		if (changes['eventoReposicaoPara']) this.eventoReposicaoPara = changes['eventoReposicaoPara'].currentValue;

        this.loadEventosReposicaoDe();
        this.setEvento();
	}
	
    getRoteiro(evento: Evento) {
        let roteiro: Roteiro; 
        if (evento.roteiro_Id) {
            roteiro = this.roteiros.find(x => x.id == evento.roteiro_Id) as Roteiro;
        }
        else {
            roteiro = this.roteiros.find(x => moment(evento.data).isBetween(x.dataInicio, x.dataFim, 'date', '[]')) as Roteiro;
        }
        return roteiro;
    }
    
    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    getSalaAula(evento: Evento) {
        return this.salaAulaPipe.transform({
            sala_Id: evento.sala_Id,
            numeroSala: evento.numeroSala,
            andar: evento.andar
        })
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

            this.loading = true;
            lastValueFrom(this.service.getList(request))
                .then(res => {
                    this.list = res.filter(aula => {
                        const alunoEstaNaAula = aula.alunos.find(x => x.aluno_Id == this.aluno!.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const naoMarcouReposicaoAinda = alunoEstaNaAula && !alunoEstaNaAula.reposicaoPara_Evento_Id;
                        const naoEhReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoDe_Evento_Id;
                        const naoGanhouPresenca = alunoEstaNaAula && alunoEstaNaAula.presente != true;

                        return alunoEstaNaAula
                            && ehAula
                            && naoMarcouReposicaoAinda
                            && naoEhReposicao
                            && naoGanhouPresenca
                    });
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
