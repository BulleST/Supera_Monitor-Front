import { Component } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { EventoService } from '../../../services/evento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Evento } from '../../../models/evento.model';
import { showAula } from '../../../utils/show-editar-aula';

@Component({
	selector: 'app-editar-aula',
	standalone: false,
	templateUrl: './editar-aula.component.html',
	styleUrl: './editar-aula.component.css',
	providers: [DialogService]
})
export class EditarAulaComponent  {
	subscription: Subscription[] = [];
	evento!: Evento;

	constructor(
		private dialogService: DialogService,
		private service: EventoService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
	) {
        let params = this.activatedRoute.snapshot.params
		
		if (!params['evento_id']) {
            this.close()
            return
        }
		else {
			let evento = this.service.getEvento().subscribe(res => {
				if (res) {
					this.evento = res;
					this.showAula();
				}
			})
			this.subscription.push(evento);
		}
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe())
    }

	close () {
		this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
	}

	showAula() {
		let ref = showAula(this.evento, this.dialogService);
		let onClose = ref.onClose.subscribe(res => {
			this.close();
		});
		this.subscription.push(onClose)
	}
}
