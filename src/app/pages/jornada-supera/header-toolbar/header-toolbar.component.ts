import { Component, OnDestroy } from '@angular/core';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-header-toolbar',
	standalone: false,
	templateUrl: './header-toolbar.component.html',
	styleUrl: './header-toolbar.component.css'
})
export class HeaderToolbarComponent implements OnDestroy {
	exibicao = false;
	subscription: Subscription[] = [];

	constructor(
		private service: JornadaSuperaService,
	) {

        this.exibicao = this.service.getExibicao().value;
	}

	ngOnDestroy(): void {
		this.subscription.forEach(e => e.unsubscribe());
	}

	exibicaoChanged() {
		console.log('exibicaoChanged', this.exibicao)
		this.service.setExibicao(this.exibicao);
	}

	atualizar() {
		this.service.onReload.emit(this.service.getRequest().value);
	}

}
