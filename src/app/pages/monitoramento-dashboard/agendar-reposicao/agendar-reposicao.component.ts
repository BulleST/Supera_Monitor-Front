import { AfterViewInit, Component } from '@angular/core';
import { showAgendarReposicao } from '../../../utils/show-agendar-reposicao';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { AlunoService } from '../../../services/alunos.service';
import { EventoService } from '../../../services/evento.service';

@Component({
	selector: 'app-agendar-reposicao',
	standalone: false,
	templateUrl: './agendar-reposicao.component.html',
	styleUrl: './agendar-reposicao.component.css',
	providers: [DialogService]
})
export class AgendarReposicaoComponent implements AfterViewInit {
	constructor(
		private eventoService: EventoService,
		private alunoService: AlunoService,
		private dialogService: DialogService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {

	}

	ngAfterViewInit(): void {
		this.show();
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
		ref.onClose.subscribe(res => {
			this.close();
		})

	}
}
