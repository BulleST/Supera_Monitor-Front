import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../../models/evento.model';
import { Subscription } from 'rxjs';
import { Aluno } from '../../../../../models/alunos.model';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { EventoService } from '../../../../../services/evento.service';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';

@Component({
	selector: 'app-aula1-evento-selected',
	standalone: false,
	templateUrl: './aula1-evento-selected.component.html',
	styleUrl: './aula1-evento-selected.component.css'
})
export class Aula1EventoSelectedComponent implements OnChanges, OnDestroy {
	evento!: Evento;
	list: Evento[] = [];
	loading = false;
	readonly = false;
	subscription: Subscription[] = [];

	@Input() aluno?: Aluno;
	@Output() onVisibleChange = new EventEmitter<boolean>();
	@Output() onEventoChanged = new EventEmitter<Evento | undefined>();

	SalaAndar = SalaAndar;

	constructor(
		private service: EventoService,
		private activatedRoute: ActivatedRoute,

	) {

		this.onVisibleChange.subscribe(res => {
			if (!res) {
				this.ngOnDestroy();
			}
		})

		let params = this.activatedRoute.snapshot.queryParamMap;
		this.readonly = !!params.get('evento_id');
		let evento = this.service.getEvento().subscribe(res => {
			if (res) {
				this.evento = res;
				this.setEvento();
			}
		});
		this.subscription.push(evento);
	}


	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
		this.setEvento();
	}

	getPerfilCognitivo(evento: Evento) {
		return evento.perfilCognitivo.map(x => x.nome).join(', ');
	}

	getSala(evento: Evento) {
		var andar = evento.andar > SalaAndar.Terreo ? evento.andar + 'º andar' : 'Térreo'
		return evento.sala + ' - ' + andar
	}


	selecionarOutraData() {
		this.evento = undefined as any;
		this.onEventoChanged.emit(undefined);
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


}
