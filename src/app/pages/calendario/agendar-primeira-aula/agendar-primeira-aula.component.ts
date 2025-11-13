import { Component, OnDestroy } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { showAgendarPrimeiraAula } from '../../../utils/show-agendar-primeira-aula';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-agendar-primeira-aula',
	standalone: false,
	templateUrl: './agendar-primeira-aula.component.html',
	styleUrl: './agendar-primeira-aula.component.css',
	providers: [DialogService]
})
export class AgendarPrimeiraAulaComponent implements OnDestroy {
	subscription: Subscription[] = [];
	
	constructor(
		private eventoService: EventoService,
		private alunoService: AlunoService,
		private dialogService: DialogService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.show();
	}
	
    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

	close() {
		let routeBack = '../../';
		let params = this.activatedRoute.snapshot.params;
		for (const [key, value] of Object.entries(params)) {
			routeBack += '../'
		}

		this.router.navigate([routeBack], { relativeTo: this.activatedRoute })
	}

	show() {
		let evento = this.eventoService.getEvento().value;
		let aluno = this.alunoService.getAluno().value;

		var ref = showAgendarPrimeiraAula(this.dialogService, aluno, evento);
		var onClose = ref.onClose.subscribe(res => {
			this.close();
		});
		this.subscription.push(onClose);

	}
}
