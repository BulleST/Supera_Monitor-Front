import { Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Evento } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { SalaAndar } from '../../../models/sala-aula.model';
import { ReposicaoDeSelectComponent } from './reposicao-de-select/reposicao-de-select.component';
import { ReposicaoParaSelectComponent } from './reposicao-para-select/reposicao-para-select.component';
import { ReposicaoAlunoSelectComponent } from './reposicao-aluno-select/reposicao-aluno-select.component';
import { showAgendarReposicaoConfirm } from '../../../utils/show-reposicao-confirm-dialog-service';
import { DialogService } from 'primeng/dynamicdialog';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';

@Component({
	selector: 'app-agendar-reposicao-dialog',
	standalone: false,
	templateUrl: './agendar-reposicao-dialog.component.html',
	styleUrl: './agendar-reposicao-dialog.component.css',
	providers: [ConfirmationService, DialogService]

})
export class AgendarReposicaoDialogComponent implements OnDestroy {

	visible = false;
	loading = false;
	subscription: Subscription[] = [];

	aluno?: Aluno;
	eventoReposicaoDe?: Evento;
	eventoReposicaoPara?: Evento;

	roteiros: Roteiro[] = [];
	loadingRoteiros = false;
	observacao: string = '';

	onHide = new EventEmitter<boolean>();
	SalaAndar = SalaAndar;

	@ViewChild('reposicaoAlunoComponent') reposicaoAlunoComponent!: ReposicaoAlunoSelectComponent;
	@ViewChild('reposicaoDeComponent') reposicaoDeComponent!: ReposicaoDeSelectComponent;
	@ViewChild('reposicaoParaComponent') reposicaoParaComponent!: ReposicaoParaSelectComponent;

	constructor(
		private eventoService: EventoService,
		private alunoService: AlunoService,
		private roteiroService: RoteiroService,
		private toastr: ToastrService,
		private mensagemWhatsapp: MensagemWhatsapp,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private confirmationService: ConfirmationService,
		private calendarioUtils: CalendarioUtils,
		private dialogService: DialogService,
	) {

		let roteiros = roteiroService.list.subscribe(res => this.roteiros = res);
		this.subscription.push(roteiros)

		if (!this.roteiros.length) {
			this.loadingRoteiros = true;
			lastValueFrom(this.roteiroService.getList(moment().year()))
				.then(res => this.loadingRoteiros = false)
				.catch(res => this.loadingRoteiros = false);
		}

		this.show();

		const aluno = this.alunoService.getAluno().subscribe(res => this.aluno = res);
		this.subscription.push(aluno)

		const eventoReposicaoDe = this.eventoService.getEventoReposicaoDe().subscribe(res => this.eventoReposicaoDe = res);
		this.subscription.push(eventoReposicaoDe)

		const eventoReposicaoPara = this.eventoService.getEventoReposicaoPara().subscribe(res => this.eventoReposicaoPara = res);
		this.subscription.push(eventoReposicaoPara)
	}


	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
		this.subscription = [];
	}


	visibleChange() {
		if (!this.visible) {

			this.reposicaoAlunoComponent.onVisibleChange.emit(false);
			this.reposicaoDeComponent.onVisibleChange.emit(false);
			this.reposicaoParaComponent.onVisibleChange.emit(false);

			this.ngOnDestroy();

			let routeBack = '../../';

			let params = this.activatedRoute.snapshot.params;
			for (const [key, value] of Object.entries(params)) {
				routeBack += '../'
			}


			this.router.navigate([routeBack], { relativeTo: this.activatedRoute })
				.then(res => {
					this.eventoService.setEvento(undefined)
					this.eventoService.setEventoReposicaoDe(undefined)
					this.eventoService.setEventoReposicaoPara(undefined)
					this.alunoService.setAluno(undefined);
				})

		}
	}

	show() {
		this.visible = true;
	}

	hide() {
		this.visible = false;
		this.onHide.emit(true);
	}

	alunoChanged(aluno: Aluno) {
		console.log('alunoChanged', aluno)
		if (!this.eventoService.getEventoReposicaoDe().value) {
			this.eventoReposicaoDe = undefined;
		}
		if (!this.eventoService.getEventoReposicaoPara().value) {
			this.eventoReposicaoPara = undefined;
		}
		this.aluno = aluno;
	}

	eventoReposicaoDeChanged(evento: Evento) {
		this.eventoReposicaoDe = evento;

		if (!this.eventoService.getEventoReposicaoPara().value) {
			this.eventoReposicaoPara = undefined;
		}
	}

	eventoReposicaoParaChanged(evento: Evento) {
		this.eventoReposicaoPara = evento;
	}

	showError(header: string, message: string, e: any) {
		showError(this.confirmationService, header, message, e);
	}

	saveDisabled(form: NgForm) {
		return this.loading
			|| form.invalid
			|| !this.aluno
			|| !this.eventoReposicaoDe
			|| !this.eventoReposicaoPara;
	}

	sendConfirmation(form: NgForm, e: any) {
		let aluno = this.aluno as Aluno;
		let source = this.eventoReposicaoDe as Evento;
		let target = this.eventoReposicaoPara as Evento;
		let participacao = source.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

		var ref = showAgendarReposicaoConfirm(participacao, source, target, this.dialogService);
		var onClose = ref.onClose.subscribe(agendamentoCancelado => {
			if (!agendamentoCancelado) {
				this.eventoService.calendarioReload.emit(1);
			}
			this.visible = false;
			this.visibleChange();
		})
		this.subscription.push(onClose);

	}

}
