import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Evento } from '../../models/evento.model';
import { CalendarioUtils } from '../../utils';

@Component({
	selector: 'app-indisponivel-tooltip',
	standalone: false,
	templateUrl: './indisponivel-tooltip.component.html',
	styleUrl: './indisponivel-tooltip.component.css'
})
export class IndisponivelTooltipComponent implements OnChanges {
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
