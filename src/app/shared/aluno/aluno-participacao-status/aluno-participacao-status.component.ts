import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Evento } from '../../../models/evento.model';
import { Crypto } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Dashboard_Aluno, Dashboard_Aula, Dashboard_Item, DashboardItemStatus } from '../../../models/dashboard.model';
import { Feriado } from '../../../models/feriado.model';

@Component({
	selector: 'app-aluno-participacao-status',
	standalone: false,
	templateUrl: './aluno-participacao-status.component.html',
	styleUrl: './aluno-participacao-status.component.css',
})
export class AlunoParticipacaoStatusComponent implements OnChanges, OnDestroy {
	@Input() evento?: Evento;
	@Input() participacao?: Evento_Participacao_Aluno;

	@Input() eventoDashItem?: Dashboard_Item;
	@Input() eventoDashAluno?: Dashboard_Aluno;
	@Output() contatarClick = new EventEmitter<boolean>();

	reposicaoDe?: Evento | Dashboard_Aula
	loadingReposicaoDe = false;
	reposicaoPara?: Evento | Dashboard_Aula
	loadingReposicaoPara = false;


	DashboardItemStatus = DashboardItemStatus;
	subscription: Subscription[] = [];
	statusContato?: { value: any, label: string };

    feriado?: Feriado;
    aulaCancelada!: boolean;
    primeiraAula!: boolean;
    presenteAula!: boolean;
    presenteReposicao!: boolean;
    faltaAula!: boolean;
    faltaReposicao!: boolean;
    faltaAgendada!: boolean;
    reposicaoAgendada!: boolean;
    alunoContactado!: boolean;
    alunoContactadoData?: Date;
    contatoObservacao?: string;
    observacao?: string;

	constructor(
		private service: EventoService,
		private crypto: Crypto,
		private router: Router,
		private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef
	) {

	}


	ngOnChanges(changes: SimpleChanges): void {
		if (changes['eventoDashItem']) {
			this.eventoDashItem = changes['eventoDashItem'].currentValue;
		}
		if (changes['eventoDashAluno']) {
			this.eventoDashAluno = changes['eventoDashAluno'].currentValue;
		}
		if (changes['evento']) {
			this.evento = changes['evento'].currentValue;
		}
		if (changes['participacao']) {
			this.participacao = changes['participacao'].currentValue;
		}
        this.setStatus();
	}

    setStatus() {
        if (this.eventoDashItem && this.eventoDashAluno) {
            this.aulaCancelada = !this.eventoDashItem.aula.active;
            this.feriado = this.eventoDashItem.feriado;
            this.primeiraAula = this.eventoDashItem.aula.id == this.eventoDashAluno.primeiraAula_Id;
            this.faltaReposicao = this.eventoDashItem.aula.finalizado 
                                        && this.eventoDashItem.participacao.active 
                                        && !this.eventoDashItem.participacao.presente
                                        && !!this.reposicaoDe;

            this.faltaAula = this.eventoDashItem.aula.finalizado 
                                        && this.eventoDashItem.participacao.active 
                                        && !this.eventoDashItem.participacao.presente
                                        && !this.reposicaoDe;

            this.faltaAgendada = !this.eventoDashItem.participacao.active 
                                        && !this.eventoDashItem.participacao.presente;

            this.presenteReposicao = this.eventoDashItem.aula.finalizado 
                                        && this.eventoDashItem.participacao.active 
                                        && this.eventoDashItem.participacao.presente === true
                                        && !!this.reposicaoDe;

            this.presenteAula = this.eventoDashItem.aula.finalizado 
                                        && this.eventoDashItem.participacao.active 
                                        && this.eventoDashItem.participacao.presente === true
                                        && !this.reposicaoDe;

            this.reposicaoAgendada = !!this.reposicaoPara 
                                    && this.reposicaoPara.active 
                                    && !this.reposicaoPara.finalizado;

            this.alunoContactadoData = this.eventoDashItem.participacao.alunoContactado;
            this.alunoContactado = !!this.alunoContactadoData;
            this.observacao = this.eventoDashItem.participacao.observacao;
            this.contatoObservacao = this.eventoDashItem.participacao.contatoObservacao;
        
        }
        else if (this.evento && this.participacao) {
            this.aulaCancelada = !this.evento.active;
            this.feriado = this.evento?.feriado;
            this.primeiraAula = this.evento.id == this.participacao.primeiraAula_Id;
            this.faltaReposicao = this.evento.finalizado 
                                        && this.participacao.active 
                                        && !this.participacao.presente
                                        && !!this.reposicaoDe;

            this.faltaAula = this.evento.finalizado 
                                        && this.participacao.active 
                                        && !this.participacao.presente
                                        && !this.reposicaoDe;

            this.faltaAgendada = !this.participacao.active 
                                        && !this.participacao.presente;

            this.presenteReposicao = this.evento.finalizado 
                                        && this.participacao.active 
                                        && this.participacao.presente === true
                                        && !!this.reposicaoDe;

            this.presenteAula = this.evento.finalizado 
                                        && this.participacao.active 
                                        && this.participacao.presente === true
                                        && !this.reposicaoDe;

            this.reposicaoAgendada = !!this.reposicaoPara 
                                    && this.reposicaoPara.active 
                                    && !this.reposicaoPara.finalizado;

            this.alunoContactadoData = this.participacao.alunoContactado;
            this.alunoContactado = !!this.alunoContactadoData;
            this.observacao = this.participacao.observacao;
            this.contatoObservacao = this.participacao.contatoObservacao;

        } 
    }


	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

    update(evento?: Evento, participacao?: Evento_Participacao_Aluno) {
		if (evento) {
			this.evento = evento;
		}
		if (participacao) {
			this.participacao = participacao;
		}

        this.setStatus();
        this.getStatus();
        this.cdr.detectChanges();

    }

	getReposicaoDe() {
        this.reposicaoDe = this.participacao?.reposicaoDe_Evento ?? this.eventoDashItem?.participacao.reposicaoDe_Evento;
        
        let id = this.participacao?.reposicaoDe_Evento_Id ?? this.eventoDashItem?.participacao.reposicaoDe_Evento_Id
		if (id && !this.reposicaoDe) {
			this.loadingReposicaoDe = true;
			this.loadReposicao(id)
				.then(res => {
					this.loadingReposicaoDe = false;
					this.reposicaoDe = res;
					if (this.participacao) {
                        this.participacao.reposicaoDe_Evento = res;
                    }
                    if (this.eventoDashItem) {
                        this.eventoDashItem.participacao.reposicaoDe_Evento = res as any;
                    }
				})
				.catch(res => this.loadingReposicaoDe = false)
		}


	}

	
	getReposicaoPara() {
        this.reposicaoPara = this.participacao?.reposicaoPara_Evento ?? this.eventoDashItem?.participacao.reposicaoPara_Evento;
        
        let id = this.participacao?.reposicaoPara_Evento_Id ?? this.eventoDashItem?.participacao.reposicaoPara_Evento_Id
		if (id && !this.reposicaoPara) {
			this.loadingReposicaoPara = true;
			this.loadReposicao(id)
				.then(res => {
					this.loadingReposicaoPara = false;
					this.reposicaoPara = res;
					if (this.participacao) {
                        this.participacao.reposicaoPara_Evento = res;
                    }
                    if (this.eventoDashItem) {
                        this.eventoDashItem.participacao.reposicaoPara_Evento = res as any;
                    }
				})
				.catch(res => this.loadingReposicaoPara = false)
		}


	}

	loadReposicao(id: number) {
		return lastValueFrom(this.service.get(id))
	}

	async goToContatoFalta() {
        let eventoId = this.evento?.id ?? this.eventoDashItem?.aula.id ?? 0; 
        let alunoId = this.participacao?.aluno_Id ?? this.eventoDashItem?.participacao.aluno_Id ?? 0; 
		if (!this.evento) {
            this.evento = await lastValueFrom(this.service.get(eventoId))
        }
        
        this.service.setEvento(this.evento);
        let eventoIdEncrypted = this.crypto.encrypt(eventoId);
        let alunoIdEncrypted = this.crypto.encrypt(alunoId);
        this.router.navigate(['contato', eventoIdEncrypted, alunoIdEncrypted], { relativeTo: this.activatedRoute });

        this.contatarClick.emit(true);
    }

	getStatus() {
		let statusList = this.service.statusContato.value;
        let statusContato_Id = this.participacao?.statusContato_Id ?? this.eventoDashItem?.participacao.statusContato_Id;
		this.statusContato = statusList.find(x => x.value == statusContato_Id);
	}
}
