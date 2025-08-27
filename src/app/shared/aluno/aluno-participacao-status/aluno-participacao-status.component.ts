import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Evento } from '../../../models/evento.model';
import { Crypto } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-aluno-participacao-status',
	standalone: false,
	templateUrl: './aluno-participacao-status.component.html',
	styleUrl: './aluno-participacao-status.component.css'
})
export class AlunoParticipacaoStatusComponent implements OnChanges, OnDestroy {
	@Input() evento!: Evento;
	@Input() participacao!: Evento_Participacao_Aluno;

	reposicaoDe?: Evento
	loadingReposicaoDe = false;
	reposicaoPara?: Evento
	loadingReposicaoPara = false;
	
	subscription: Subscription[] = [];
	statusContato?: { value: any, label: string };


	constructor(
		private service: EventoService,
		private crypto: Crypto,
		private router: Router,
		private activatedRoute: ActivatedRoute,
	) {
		
	}


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
        }
        if (changes['participacao']) {
            this.participacao = changes['participacao'].currentValue;

			this.getStatus();
			this.getReposicaoDe();
			this.getReposicaoPara();

        }
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

	getReposicaoDe() {
			if (this.participacao.reposicaoDe_Evento_Id) {
				this.loadingReposicaoDe = true;
				this.loadReposicao(this.participacao.reposicaoDe_Evento_Id)
				.then(res => {
					this.loadingReposicaoDe = false;
					this.reposicaoDe = res;
				})
				.catch(res => this.loadingReposicaoDe = false)
			}


	}

	getReposicaoPara() {
			if (this.participacao.reposicaoPara_Evento_Id) {
				this.loadingReposicaoPara = true;
				this.loadReposicao(this.participacao.reposicaoPara_Evento_Id)
				.then(res => {
					this.loadingReposicaoPara = false;
					this.reposicaoPara = res;
				})
				.catch(res => this.loadingReposicaoPara = false)
			}


	}

	loadReposicao(id: number) {
		return lastValueFrom(this.service.get(id))
	}

    goToContatoFalta() {
        if (this.evento) {
            this.service.setEvento(this.evento);
            let eventoIdEncrypted = this.crypto.encrypt(this.evento.id);
            let alunoIdEncrypted = this.crypto.encrypt(this.participacao.aluno_Id);
            this.router.navigate([ 'contato', eventoIdEncrypted, alunoIdEncrypted ], { relativeTo: this.activatedRoute });
        }
    }

	getStatus() {
		let statusList = this.service.statusContato.value;
		this.statusContato = statusList.find(x => x.value == this.participacao.statusContato_Id);
	}
}
