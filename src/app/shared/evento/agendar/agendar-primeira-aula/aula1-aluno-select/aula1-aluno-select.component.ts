import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento } from '../../../../../models/evento.model';
import { AlunoService } from '../../../../../services/alunos.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Crypto, MensagemWhatsapp, showError } from '../../../../../utils';
import moment from 'moment';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';

@Component({
	selector: 'app-aula1-aluno-select',
	standalone: false,
	templateUrl: './aula1-aluno-select.component.html',
	styleUrl: './../agendar-primeira-aula.component.css',
	providers: [ConfirmationService],
	viewProviders: [{ provide: ControlContainer, useExisting: NgForm }] // Permite validação de form pai em input de componente filho
})
export class Aula1AlunoSelectComponent implements OnChanges, OnDestroy {

	aluno_Id?: number;
	aluno?: Aluno;
	alunos: Aluno[] = [];
	loadingAlunos = false;
	loading = false;
	readonly = false;
	subscription: Subscription[] = [];

	@Input() evento?: Evento;
	@Output() onAlunoChanged = new EventEmitter<Aluno>();
	@Output() onVisibleChange = new EventEmitter<boolean>();

	constructor(
		private service: AlunoService,
		private crypto: Crypto,
		private activatedRoute: ActivatedRoute,
		private toastr: ToastrService,
		private mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,

	) {

		this.onVisibleChange.subscribe(res => {
			if (!res) {
				this.ngOnDestroy();
			}
		})

		let aluno = this.service.getAluno().subscribe(alunoRes => {

			let params = this.activatedRoute.snapshot.paramMap;
			let alunoIdParam = params.get('aluno_id');
			this.readonly = !!alunoIdParam;


			if (!alunoRes && alunoIdParam) {
				this.aluno_Id = this.crypto.decrypt(alunoIdParam);

				if (!this.aluno_Id) return;

				this.loadAluno(this.aluno_Id)
					.then(aluno => {
						this.service.setAluno(aluno)
						this.onAlunoChanged.emit(aluno);
					})
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

					if (alunoRes) {
						let index = this.alunos.findIndex(x => x.id == alunoRes.id);
						if (index != -1) this.alunos.splice(index, 1, alunoRes);
						this.aluno = this.alunos[index];
					}
				});
				this.subscription.push(alunos)

			}
		});
		this.subscription.push(aluno);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue;
		this.setAlunos();
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	enviarMensagem(aluno: Aluno) {
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}

	getRestricoes(aluno: Aluno) {
		let restricoes = aluno.restricoes.filter(x => x.active).map(x => x.descricao)
		return restricoes.length ? restricoes.join(', ') : 'Nenhuma restrição';
	}

	setAlunos() {
		if (this.alunos.length && this.evento) {
			this.alunos = this.service.list.value;

			if (this.evento) {
				var evento = this.evento as Evento;
				this.alunos = this.alunos.filter(aluno => {
					
					const alunoEstaNaAula = evento.alunos.find(x => x.aluno_Id == aluno.id);
					const falta = alunoEstaNaAula && alunoEstaNaAula.presente === false;
					const faltaAgendada = alunoEstaNaAula && alunoEstaNaAula.active === false;
					const reposicaoDe = alunoEstaNaAula && alunoEstaNaAula.reposicaoDe_Evento_Id;
					const reposicaoPara = alunoEstaNaAula && alunoEstaNaAula.reposicaoPara_Evento_Id;
					const primeiraAula = aluno.primeiraAula_Id == evento.id;
					const salaCompativel = !aluno.restricaoMobilidade || evento.andar == SalaAndar.Terreo;
					const temVagas = evento.vagasDisponiveisEvento > 0;
					const alunoAtivo = aluno.active || moment(aluno.deactivated).isSameOrAfter(evento.data, 'date');
					const alunosDoEvento = temVagas || alunoEstaNaAula;

					return alunosDoEvento
						&& salaCompativel
						&& alunoAtivo
						&& !primeiraAula
						&& !falta
						&& !faltaAgendada
						&& !reposicaoDe
						&& !reposicaoPara

				})

			}
		}
	}

	loadAluno(aluno_Id: number) {
		this.loading = true;

		let aluno = this.alunos.find(x => x.id == aluno_Id) as Aluno;
		this.onAlunoChanged.emit(aluno);

		return lastValueFrom(this.service.get(aluno_Id))
			.then(res => {
				this.aluno = res;
				let index = this.alunos.findIndex(x => x.id == res.id);
				if (index != -1) this.alunos.splice(index, 1, res);
				this.loading = false;
				return res;
			})
			.catch(res => {
				this.loading = false;
				this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
				return aluno;
			})
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}

	async alunoChanged(e: SelectChangeEvent, model: NgModel) {
		console.log('aula1 alunoChanged', this.aluno)
		if (this.aluno) {
			this.aluno = await this.loadAluno(this.aluno.id);

			if (this.aluno.restricaoMobilidade && this.evento?.sala_Id == SalaAndar.Terreo) {
				var data = moment(this.evento.data).format('DD/MM/YYYY HH:mm')
				return this.showError('Sala Incompatível',
					`O aluno tem mobilidade reduzida e não poderá participar da aula no dia ${data} na sala ${this.evento.sala} no ${this.evento.andar}º andar`,
					e.originalEvent
				)
			}
			var restricoes = this.aluno.restricoes.filter(x => x.active)
			if (restricoes.length || this.aluno.restricaoMobilidade) {

				let message = 'Esse aluno possui as seguintes restrições. <ul class="my-1">';

				if (this.aluno.restricaoMobilidade) {
					message += '<li>Restrição de mobilidade.</li>'
				}
				if (restricoes.length)
					message += restricoes.map(x => `<li>${x.descricao}</li>`).join('');

				message += '</ul> Deseja continuar?';

				this.confirmationService.confirm({
					target: e.originalEvent.target as any,
					header: 'Continuar?',
					message: message,
					acceptLabel: 'Continuar',
					rejectLabel: 'Cancelar',
					acceptIcon: 'pi pi-check',
					rejectIcon: 'pi pi-times',
					acceptButtonStyleClass: ' p-button-rounded',
					rejectButtonStyleClass: ' p-button-rounded p-button-outlined',
					accept: () => {

						this.onAlunoChanged.emit(this.aluno)
						this.service.setAluno(this.aluno)
						this.aluno_Id = this.aluno!.id;
					},
					reject: () => {
						model.control.setValue(null);
						this.onAlunoChanged.emit(undefined)
						this.service.setAluno(undefined)
						this.aluno_Id = undefined;
					}
				});
			} else {
				this.onAlunoChanged.emit(this.aluno)
				this.service.setAluno(this.aluno)
				this.aluno_Id = this.aluno.id;
			}
		}
	}


}
