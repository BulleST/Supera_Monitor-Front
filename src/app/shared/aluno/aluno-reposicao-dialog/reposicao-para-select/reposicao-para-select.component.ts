import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { EventoService } from '../../../../services/evento.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Aluno } from '../../../../models/alunos.model';
import { CalendarioRequest } from '../../../../models/calendario.model';
import moment from 'moment';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { SalaAndar } from '../../../../models/sala-aula.model';
import { NgModel } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Roteiro } from '../../../../models/roteiro.model';
import { SalaAulaPipe } from '../../../../utils/sala-aula.pipe';

@Component({
	selector: 'app-reposicao-para-select',
	standalone: false,
	templateUrl: './reposicao-para-select.component.html',
	styleUrl: '../aluno-reposicao-dialog.component.css',
    providers: [ConfirmationService]
})
export class ReposicaoParaSelectComponent implements OnChanges, OnDestroy {
	evento?: Evento;
	list: Evento[] = [];
	loading = false;
	readonly = false;
	subscription: Subscription[] = [];
	
	@Input() roteiros: Roteiro[] = [];
	@Input() aluno?: Aluno;
	@Input() eventoReposicaoDe?: Evento;
	@Output() onEventoChanged = new EventEmitter<Evento>();
	@Output() onVisibleChange = new EventEmitter<boolean>();

    SalaAndar = SalaAndar;

    constructor(
		private service: EventoService,
		private activatedRoute: ActivatedRoute,
		private toastr: ToastrService,
		private confirmationService: ConfirmationService,
        private salaAulaPipe: SalaAulaPipe,
        
	) {
		this.onVisibleChange.subscribe(res => {
			if (!res) {
				this.ngOnDestroy();
			}
		})

		let eventoReposicaoPara = this.service.getEventoReposicaoPara().subscribe(res => {
			let params = this.activatedRoute.snapshot.paramMap;
            this.readonly = !!params.get('evento_reposicao_para');
            this.evento = res;
            this.setEvento();
		});
		this.subscription.push(eventoReposicaoPara);
	}

	
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
		if (changes['roteiros']) this.roteiros = changes['roteiros'].currentValue;
		if (changes['eventoReposicaoDe']) this.eventoReposicaoDe = changes['eventoReposicaoDe'].currentValue;

        this.loadEventosReposicaoPara();
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
    loadEventosReposicaoPara() {
        if (!this.aluno) {
            return undefined;
        }
        else if (!this.eventoReposicaoDe) {
            return undefined;
        }
        else  {
            let request: CalendarioRequest = {
                perfil_Cognitivo_Id: this.aluno.perfilCognitivo_Id,
                intervaloDe: moment(this.eventoReposicaoDe.data).toDate(),
                intervaloAte: moment(this.eventoReposicaoDe.data).add(1, 'month').toDate(),
            }

            this.loading = true;
            return lastValueFrom(this.service.getList(request))
                .then(res => {

                    this.list = res.filter(aula => {
                        const aulaAtiva = aula.active;
                        const alunoNaoEstaNaAula = !aula.alunos.find(x => x.aluno_Id == this.aluno!.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const temVagas = aula.alunos.filter(x => x.active).length < aula.capacidadeMaximaEvento;
                        const perfilCognitivo = aula.perfilCognitivo.map(x => x.id).includes(this.aluno!.perfilCognitivo_Id);
                        const aulaNaoFinalizada = !aula.finalizado;
                        const aulaEstaAtiva = aula.active;
                        const ehPerfilCognitivoCompativel = aula.perfilCognitivo.map(x => x.id).includes(this.aluno!.perfilCognitivo_Id);
                        const naoEhFeriado = !aula.feriado;
                        const salaValida = !this.aluno?.restricaoMobilidade || (this.aluno.restricaoMobilidade && aula.andar == SalaAndar.Terreo)
                        const mesmaAula = this.eventoReposicaoDe!.id == aula.id && ![aula.id].includes(PseudoEvento.EventoId);
                        const mesmaDataHora = moment(this.eventoReposicaoDe!.data).isSame(aula.data);

                        return aulaAtiva
                            && alunoNaoEstaNaAula
                            && ehAula
                            && temVagas
                            && perfilCognitivo
                            && aulaNaoFinalizada
                            && aulaEstaAtiva
                            && ehPerfilCognitivoCompativel
                            && naoEhFeriado
                            && salaValida
                            && !mesmaAula
                            && !mesmaDataHora;

                    });

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

    eventoChanged(e: any, model: NgModel) {

        if (this.evento && this.aluno) {
            if (this.aluno.restricoes.length > 0) {
                this.confirmRestricoes(e, model);
            } else {
                this.selectEventoReposicaoPara()
            }
        }
    }

    confirmRestricoes(e: any, model: NgModel) {
        return this.confirmationService.confirm({
            target: e.target,
            message: 'O aluno possui algumas restrições. Deseja continuar?',
            header: 'Restrições',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check', 
            rejectIcon: 'pi pi-times', 
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => this.selectEventoReposicaoPara(),
            reject: () => {
                model.control.setValue(null);
                this.evento = undefined;
                this.service.setEventoReposicaoPara(undefined)
            }
        });
    }

    selectEventoReposicaoPara() {
        if (this.evento) {
            if (!this.evento.roteiro_Id || this.evento.roteiro_Id == PseudoEvento.EventoId) {
                let roteiro = this.getRoteiro(this.evento)
                this.evento.roteiro_Id = roteiro?.id;
                this.evento.semana = roteiro?.semana;
                this.evento.tema = roteiro?.tema;
            }
    
            this.evento = this.evento;
            this.service.setEventoReposicaoPara(this.evento)
            this.onEventoChanged.emit(this.evento);
        }
    }
}
