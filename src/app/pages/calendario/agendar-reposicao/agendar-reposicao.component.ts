import { Component, OnDestroy } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import { DialogService } from 'primeng/dynamicdialog';
import { showAgendarReposicao } from '../../../utils/show-agendar-reposicao';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-agendar-reposicao',
	standalone: false,
	templateUrl: './agendar-reposicao.component.html',
	styleUrl: './agendar-reposicao.component.css',
	providers: [DialogService]
})
export class AgendarReposicaoComponent implements OnDestroy {
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
		let reposicaoDe = this.eventoService.getEventoReposicaoDe().value;
		let reposicaoPara = this.eventoService.getEventoReposicaoPara().value;
		let aluno = this.alunoService.getAluno().value;

		var ref = showAgendarReposicao(this.dialogService, aluno, reposicaoDe, reposicaoPara);
		var onClose = ref.onClose.subscribe(res => {
			this.close();
		});
		this.subscription.push(onClose);

	}
}
