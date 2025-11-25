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
				// this.loadAluno()
				return;
			}

			if (!this.alunoService.list.value.length) {
				this.loadingAlunos = true;
				lastValueFrom(this.alunoService.getList())
					.then(res => this.loadingAlunos = false)
					.catch(res => this.loadingAlunos = false);
			}

			let alunos = this.alunoService.list.subscribe(list => {
				this.alunos = list;

				this.setAlunos();

				this.setAluno();
			});
			this.subscription.push(alunos)

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
		let index = this.alunos.findIndex(x => x.id == this.aluno_Id);
		this.aluno = this.alunos[index];
        return this.aluno;
	}

	setAlunos() {
		this.alunos = this.alunoService.list.value;
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

	// loadAluno() {
    //     if (!this.aluno_Id) return;
	// 	this.loading = true;
		
	// 	this.setAluno();

	// 	return lastValueFrom(this.alunoService.get(this.aluno_Id))
	// 		.then(res => {
    //             this.aluno = res;
    //             this.loading = false;
    //             this.alunoService.setAluno(this.aluno)
    //             this.onAlunoChanged.emit(this.aluno);

	// 			return res;
	// 		})
	// 		.catch(res => {
	// 			this.loading = false;
	// 			this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
	// 			this.onAlunoChanged.emit(this.aluno);
	// 			return this.aluno;
	// 		})
	// }

	alunoChanged(e: SelectChangeEvent, model: NgModel) {
		if (e.value) {
			this.aluno_Id = e.value;
			this.aluno = this.alunos.find(x => x.id == this.aluno_Id)
			this.onAlunoChanged.emit(this.aluno)
			// this.loadAluno()
		}
	}
	
	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}



}
