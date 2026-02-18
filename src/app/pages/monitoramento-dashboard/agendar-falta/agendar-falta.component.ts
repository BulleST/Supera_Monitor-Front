import { Component, OnDestroy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { showAgendarFalta } from '../../../utils/show-agendar-falta';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-agendar-falta',
	standalone: false,
	templateUrl: './agendar-falta.component.html',
	styleUrl: './agendar-falta.component.css',
	providers: [DialogService]
})
export class AgendarFaltaComponent implements OnDestroy {
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

	close(success: boolean) {
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

		var ref = showAgendarFalta(this.dialogService, aluno, evento); 
		var onClose = ref.onClose.subscribe(res => {
			this.close(res);
		});
		this.subscription.push(onClose);

	}
}