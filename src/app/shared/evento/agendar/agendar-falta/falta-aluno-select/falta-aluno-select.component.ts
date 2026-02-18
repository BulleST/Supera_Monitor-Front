import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento } from '../../../../../models/evento.model';
import { AlunoService } from '../../../../../services/alunos.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Crypto, MensagemWhatsapp, showError } from '../../../../../utils';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { EventoService } from '../../../../../services/evento.service';

@Component({
	selector: 'app-falta-aluno-select',
	standalone: false,
	templateUrl: './falta-aluno-select.component.html',
	styleUrl: './../agendar-falta.component.css',
	providers: [ConfirmationService],
	viewProviders: [{ provide: ControlContainer, useExisting: NgForm }] // Permite validação de form pai em input de componente filho
})
export class FaltaAlunoSelectComponent implements OnDestroy {

	aluno_Id?: number;
	aluno?: Aluno;
	alunos: Aluno[] = [];
	loadingAlunos = false;
	loading = false;
	readonly = false;
	subscription: Subscription[] = [];

	evento?: Evento;
	@Output() onAlunoChanged = new EventEmitter<Aluno>();

	constructor(
		private alunoService: AlunoService,
		private crypto: Crypto,
		private activatedRoute: ActivatedRoute,
		private mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,
		private eventoService: EventoService,

	) {

		this.loadAlunos();

		let evento = this.eventoService.getEvento().subscribe(res => {
			this.evento = res;
			this.setAlunos();
		});
		this.subscription.push(evento)

		let aluno = this.alunoService.getAluno().subscribe(alunoRes => {

			let params = this.activatedRoute.snapshot.queryParamMap;

			let idParam = params.get('aluno_id');

			this.readonly = idParam != null && idParam != 'null';

			if (idParam) {
				this.aluno_Id = this.crypto.decrypt(idParam);
			}

			this.aluno_Id = alunoRes?.id;
			this.aluno = alunoRes;

			if (!alunoRes && idParam) {
				this.aluno_Id = this.crypto.decrypt(idParam);
				return;
			}
			this.setAlunos();
		});
				this.subscription.push(aluno);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue;
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	loadAlunos() {
		this.loadingAlunos = true;
		lastValueFrom(this.alunoService.getListAgendarFaltaDropdown())
			.then(res => {
				this.loadingAlunos = false;
				this.alunos = res;
				this.setAlunos();
			})
			.catch(res => this.loadingAlunos = false);
	}


	setAlunos() {
		if (this.alunos.length && this.evento) {
			const evento = this.evento as Evento;

			this.alunos = this.alunos.filter(aluno => {
				const alunoEstaNaAula = evento.alunos.find(x => x.aluno_Id == aluno.id);
				const alunoAtivo = alunoEstaNaAula?.active;
				const alunoNaoMarcouFalta = alunoEstaNaAula
					&& alunoEstaNaAula.active
					&& alunoEstaNaAula.presente !== false;

				const result = alunoEstaNaAula
					&& alunoAtivo
					&& alunoNaoMarcouFalta;

				return result;
			})
		}
		
		this.setAluno();
	}

	setAluno() {
		if (this.alunos.length && this.aluno_Id) {
			let index = this.alunos.findIndex(x => x.id == this.aluno_Id);
			this.aluno = this.alunos[index];
		}
		return this.aluno;
	}

	enviarMensagem(aluno: Aluno) {
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}


	alunoChanged(e: SelectChangeEvent, model: NgModel) {
		this.aluno_Id = e.value;
		this.aluno = this.alunos.find(x => x.id == this.aluno_Id)
		this.onAlunoChanged.emit(this.aluno);
		this.alunoService.setAluno(this.aluno);
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}



}
