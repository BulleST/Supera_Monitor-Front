import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Evento } from '../../../models/evento.model';
import { showContato } from '../../../utils/show-contato';
import { DialogService } from 'primeng/dynamicdialog';
import { EditarContatoTipo } from '../editar-participacao-contato/editar-participacao-contato.component';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../services/evento.service';

@Component({
	selector: 'app-evento-participacao-status',
	standalone: false,
	templateUrl: './evento-participacao-status.component.html',
	styleUrl: './evento-participacao-status.component.css',
	providers: [DialogService]
})
export class EventoParticipacaoStatusComponent implements OnChanges {

	@Input() participacao!: Evento_Participacao_Aluno;
	@Input() evento!: Evento;
	@Input() reposicaoPara?: Evento;
	@Input() reposicaoDe?: Evento;
	@Input() primeiraAula_Id?: number;

	participacao_ReposicaoDe?: Evento_Participacao_Aluno
	participacao_ReposicaoPara?: Evento_Participacao_Aluno
	EditarContatoTipo = EditarContatoTipo;

	constructor(
		private dialogService: DialogService,
		private service: EventoService
	) { }


	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue;
		if (changes['participacao']) this.participacao = changes['participacao'].currentValue;
		if (changes['reposicaoPara']) this.reposicaoPara = changes['reposicaoPara'].currentValue;
		if (changes['reposicaoDe']) this.reposicaoDe = changes['reposicaoDe'].currentValue;
		if (changes['primeiraAula_Id']) this.primeiraAula_Id = changes['primeiraAula_Id'].currentValue;


		if (this.participacao) {
			this.loadReposicoes()
			.then(res => {
				if (this.reposicaoDe) {
					this.participacao_ReposicaoDe = this.reposicaoDe.alunos.find(x => x.aluno_Id == this.participacao.aluno_Id);
				}
				if (this.reposicaoPara) {
					this.participacao_ReposicaoPara = this.reposicaoPara.alunos.find(x => x.aluno_Id == this.participacao.aluno_Id);
				}
			})
		}

	}

	showContatoFalta() {
		showContato(this.dialogService, this.evento, this.participacao);
	}


	async loadReposicoes() {
		var reqs: any[] = []
		if (this.participacao.reposicaoDe_Evento_Id && !this.reposicaoDe) {
			var req = lastValueFrom(this.service.get(this.participacao.reposicaoDe_Evento_Id))
				.then(res => {
					this.participacao.reposicaoDe_Evento = res;
					this.reposicaoDe = res;
				})
			reqs.push(req);
		}
		if (this.participacao.reposicaoPara_Evento_Id && !this.reposicaoPara) {
			var req = lastValueFrom(this.service.get(this.participacao.reposicaoPara_Evento_Id))
				.then(res => {
					this.participacao.reposicaoPara_Evento = res;
					this.reposicaoDe = res;
				})
			reqs.push(req);
		}

		await Promise.all(reqs)
		return this.participacao;
	}
}
