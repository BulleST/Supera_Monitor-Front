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
		private service: AlunoService,
		private crypto: Crypto,
		private activatedRoute: ActivatedRoute,
		private toastr: ToastrService,
		private mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,
		private eventoService: EventoService,

	) {

		let evento = this.eventoService.getEvento().subscribe(res => {
			this.evento = res;
				this.setAluno();
			this.setAlunos();
		});
		this.subscription.push(evento)

		let aluno = this.service.getAluno().subscribe(alunoRes => {

			let params = this.activatedRoute.snapshot.queryParamMap;
			let alunoIdParam = params.get('aluno_id');
			this.readonly = !!alunoIdParam;

			if (!alunoRes && alunoIdParam) {
				this.aluno_Id = this.crypto.decrypt(alunoIdParam);

				if (!this.aluno_Id) return;

				this.loadAluno(this.aluno_Id)
				return;
			}

			this.aluno = alunoRes;
			this.aluno_Id = alunoRes?.id;

			if (!this.readonly) {
				if (!this.service.list.value.length) {
					this.loadingAlunos = true;
					lastValueFrom(this.service.getList())
						.then(res => this.loadingAlunos = false)
						.catch(res => this.loadingAlunos = false);
				}

				let alunos = this.service.list.subscribe(list => {
					this.alunos = list;

					this.setAlunos();

					this.setAluno();
				});
				this.subscription.push(alunos)

			}
		});
		this.subscription.push(aluno);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue;
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	enviarMensagem(aluno: Aluno) {
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}

	setAluno() {
		if (this.aluno) {
			let index = this.alunos.findIndex(x => x.id == this.aluno!.id);
			if (index != -1) this.alunos.splice(index, 1, this.aluno);
			this.aluno = this.alunos[index];
		}
	}
	setAlunos() {
		this.alunos = this.service.list.value;
		if (this.alunos.length && this.evento) {
			if (this.evento) {
				var evento = this.evento as Evento;
				this.alunos = this.alunos.filter(aluno => {
					const alunoEstaNaAula = evento.alunos.find(x => x.aluno_Id == aluno.id);
					const alunoAtivo = alunoEstaNaAula?.active;
					const alunoNaoMarcouFalta = alunoEstaNaAula 
						&& alunoEstaNaAula.active 
						&& alunoEstaNaAula.presente !== false;

					return alunoEstaNaAula
						&& alunoAtivo
						&& alunoNaoMarcouFalta;

				})

			}
		}
		this.setAluno();
	}

	loadAluno(aluno_Id: number) {
		this.loading = true;


		return lastValueFrom(this.service.get(aluno_Id))
			.then(res => {
				this.aluno = res;
				this.setAluno();
				return res;
			})
			.catch(res => {
				this.loading = false;
				this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
				let aluno = this.alunos.find(x => x.id == aluno_Id) as Aluno;
				this.onAlunoChanged.emit(aluno);
				return aluno;
			})
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}

	alunoChanged(e: SelectChangeEvent, model: NgModel) {
		if (this.aluno) {
			this.onAlunoChanged.emit(this.aluno)
			this.service.setAluno(this.aluno)
			this.aluno_Id = this.aluno?.id;
			this.loadAluno(this.aluno.id)
				this.setAluno();
		}
	}


}
