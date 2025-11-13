import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { Aluno } from '../../../../models/alunos.model';
import { SalaAndar } from '../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../../services/evento.service';
import { AlunoService } from '../../../../services/alunos.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../../utils';
import moment from 'moment';
import { PrimeiraAulaRequest, PseudoEvento } from '../../../../models/reposicao.model';
import { RequestResponse } from '../../../../helpers/request-response.interface';
import { Aluno_Restricao } from '../../../../models/aluno-restricao.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
	selector: 'app-agendar-primeira-aula',
	standalone: false,
	templateUrl: './agendar-primeira-aula.component.html',
	styleUrl: './agendar-primeira-aula.component.css',
	providers: [ConfirmationService]

})
export class AgendarPrimeiraAulaComponent implements OnInit, OnDestroy {
	visible: boolean = false
	subscription: Subscription[] = [];
	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;
	view = new AgendarPrimeiraAulaView;

	evento?: Evento;
	aluno?: Aluno;
	restricaoCheck: boolean = false

	SalaAndar = SalaAndar;
	EventoTipo = EventoTipo;

	restricoes: Aluno_Restricao[] = [];

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private eventoService: EventoService,
		private alunoService: AlunoService,
		private toastrService: ToastrService,
		private confirmationService: ConfirmationService,
		private calendarioUtils: CalendarioUtils,
		private mensagemWhatsapp: MensagemWhatsapp,
	) {
		this.instance = this.dialogService.getInstance(this.ref);

		let evento = this.eventoService.getEvento().subscribe(res => this.evento = res);
		this.subscription.push(evento)

		let aluno = this.alunoService.getAluno().subscribe(res => this.aluno = res)
		this.subscription.push(aluno)

		this.visible = true;
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
		}
	}

	ngOnDestroy(): void {
		this.subscription.forEach((item) => item.unsubscribe())
	}

	close() {
		this.eventoService.setEvento(undefined)
		this.alunoService.setAluno(undefined);
		this.ref.close();
	}

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}


	alunoChanged(aluno: Aluno) {
		if (!this.eventoService.getEvento().value) {
			this.evento = undefined;
		}
		this.restricoes = aluno.restricoes.filter(x => x.active)
		this.aluno = aluno;
		this.restricaoCheck = false;
	}

	eventoChanged(evento?: Evento) {
		this.evento = evento;
		this.eventoService.setEvento(evento);
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}


	enviarMensagem(aluno: Aluno) {
		if (!aluno.celular) {
			this.showError('Erro', 'Nenhum celular cadastrado', aluno);
			return;
		}
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}

	formatDate(evento: Evento) {
		return this.calendarioUtils.formatDate(evento.data)
	}

	sendConfirmation(e: any) {
		if (!this.aluno) {
			this.toastrService.error('Selecione um aluno')
		}
		else if (!this.evento) {
			this.toastrService.error('Selecione uma aula')
		}
		else {
			let data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
			this.confirmationService.confirm({
				target: e.target,
				message: `Tem certeza que deseja marcar primeira aula do aluno <b>${this.aluno.nome} </b> para o dia <b>${data}</b>?`,
				header: 'Agendar primeira aula',
				acceptIcon: 'pi pi-check',
				rejectIcon: 'pi pi-times',
				acceptLabel: 'Agendar',
				rejectLabel: 'Cancelar',
				acceptButtonStyleClass: 'p-button-rounded',
				rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
				accept: () => {
					this.send(e, this.aluno!, this.evento!)
				},
				reject: () => { },
			})
		}
	}

	async send(e: any, aluno: Aluno, evento: Evento) {
		this.loading = true

		let request = new PrimeiraAulaRequest()
		request.aluno_Id = aluno.id
		request.evento_Id = evento.id

		let response!: RequestResponse

		// Se a aula target não existir, cria a aula
		if (request.evento_Id == PseudoEvento.EventoId) {
			response = await this.requestAulaTurma(evento)
				.catch(res => {
					this.loading = false;
					return res;
				})
			request.evento_Id = response.object.id
			if (!response.success) {
				this.loading = false;
				return this.showError(
					'Primeira aula não agendada',
					`Ocorreu um erro ao agendar primeira aula. <br> ${response.message}`,
					e,
				)
			}
		}

		lastValueFrom(this.eventoService.primeiraAula(request))
			.then(response => {
				if (response.success) {
					this.loading = false;
					this.eventoService.calendarioReload.emit(request.evento_Id);
					this.toastrService.success(response.message);
					if (this.aluno?.celular) {
						this.sendMensagemAluno(e, evento);
					} else {
						this.close();
					}

				} else {
					this.loading = false;
					this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, response.message)
				}

			})
			.catch(res => {
				this.loading = false;
				this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, res.message)
			})
	}


	requestAulaTurma(evento: Evento) {
		return this.calendarioUtils.requestAulaTurma(evento);
	}

	sendMensagemAluno(e: any, evento: Evento) {
		let aluno = this.aluno as Aluno
		this.confirmationService.confirm({
			target: e.target,
			message: `Primeira aula agendada com sucesso. <br> Clique para enviar mensagem de confirmação.`,
			header: 'Enviar whatsapp',
			icon: 'pi pi-whatsapp text-green-500 text-4xl',
			acceptIcon: 'pi pi-whatsapp',
			rejectIcon: 'pi pi-times',
			acceptLabel: `Enviar mensagem`,
			rejectLabel: 'Não enviar',
			acceptButtonStyleClass: 'p-button-rounded p-button-success',
			rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
			accept: () => {
				this.close();
				let object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento)
				window.open(object.link, '_target')
				this.mensagemWhatsapp.copiarMensagem(object.mensagem)
			},
			reject: () => {
				this.close();
			},
		})
	}

}

export class AgendarPrimeiraAulaView {
	aluno?: Aluno;
	evento?: Evento;
}