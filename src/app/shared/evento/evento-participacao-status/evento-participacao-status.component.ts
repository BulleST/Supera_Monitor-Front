import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Evento } from '../../../models/evento.model';

@Component({
	selector: 'app-evento-participacao-status',
	standalone: false,
	templateUrl: './evento-participacao-status.component.html',
	styleUrl: './evento-participacao-status.component.css'
})
export class EventoParticipacaoStatusComponent implements OnChanges {

	@Input() participacao!: Evento_Participacao_Aluno;
	@Input() evento!: Evento;

	constructor() { }


	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue
		if (changes['participacao']) this.participacao = changes['participacao'].currentValue
	}
}
