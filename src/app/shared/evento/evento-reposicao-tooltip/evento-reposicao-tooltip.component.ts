import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarioUtils } from '../../../utils';
import { Evento } from '../../../models/evento.model';

@Component({
	selector: 'app-evento-reposicao-tooltip',
	standalone: false,
	templateUrl: './evento-reposicao-tooltip.component.html',
	styleUrl: './evento-reposicao-tooltip.component.css'
})
export class EventoReposicaoTooltipComponent implements OnChanges {
	@Input() evento!: Evento;

	tipo: string = ''
	constructor(
		private calendarioUtils: CalendarioUtils,
	) {

	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue;

		this.tipo = this.getTipo(this.evento)
	}


	getTipo(e: Evento) {
		return this.calendarioUtils.getEventoTipo(e)
	}


}
