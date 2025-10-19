import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ScrollerOptions } from 'primeng/api';
import { EventoService } from '../../../../services/evento.service';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { lastValueFrom } from 'rxjs';
import { CalendarioRequest } from '../../../../models/calendario.model';
import moment, { months } from 'moment';
import { Aluno } from '../../../../models/alunos.model';

@Component({
	selector: 'app-reposicao-de-select',
	standalone: false,
	templateUrl: './reposicao-de-select.component.html',
	styleUrl: './reposicao-de-select.component.css'
})
export class ReposicaoDeSelectComponent implements OnChanges {
	@Input() aluno!: Aluno;
	@Input() selected?: Evento;
	@Input() readonly: boolean = false;
	@Output() onSelect = new EventEmitter<Evento>();
	eventos: Evento[] = [];
	items: Evento[] = [];
	loading: boolean = false;

	request: CalendarioRequest = {
		intervaloDe: moment().subtract(1, 'month').toDate(),
		intervaloAte: moment().endOf('month').toDate(),
		aluno_Id: 3996,
	}

	constructor(
		private service: EventoService
	) {
		this.items = [];
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
		if (changes['selected']) this.selected = changes['selected'].currentValue;
		if (changes['readonly']) this.readonly = changes['readonly'].currentValue;

		this.request.aluno_Id = this.aluno.id;

		if (!this.readonly && !this.selected) {
			
			this.request.intervaloDe =  moment().subtract(1, 'month').toDate();
			this.request.intervaloAte =  moment(new Date).endOf('month').toDate();

			this.loadEventos()
			.then(res => {
				this.items = res;
			})
		}
	}

	loadEventos() {
		return lastValueFrom(this.service.getList(this.request))
		.then(res => {

			const list = res.filter(evento => {
				const alunoEstaNaAula = evento.alunos.find(x => x.aluno_Id == this.aluno.id);
				const ehAula = evento.evento_Tipo_Id == EventoTipo.Aula || evento.evento_Tipo_Id == EventoTipo.TurmaExtra;
				const naoMarcouReposicaoAinda = alunoEstaNaAula && !alunoEstaNaAula.reposicaoPara_Evento_Id;
				const naoEhReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoDe_Evento_Id;
				const naoGanhouPresenca = alunoEstaNaAula && alunoEstaNaAula.presente != true;
				const final = alunoEstaNaAula
							&& ehAula
							&& naoMarcouReposicaoAinda
							&& naoEhReposicao
							&& naoGanhouPresenca;
				return final;

			})

			this.eventos.push(...list);
			this.items = this.eventos;
			this.loading = false;
			return list;
		})
		.catch(res => {
			this.loading = false;
			return [];
		})

	}

	carregarMais() {
		this.request.intervaloDe = moment(this.request.intervaloAte).add(1, 'month').startOf('month').toDate();
		this.request.intervaloAte = moment(this.request.intervaloDe).add(1, 'month').toDate();
		this.loadEventos();
		this.loading = false;
	}

	getParticipacaoAluno(evento: Evento) {
		return evento.alunos.find(x => x.aluno_Id == this.aluno.id);
	}
}