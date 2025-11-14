import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { Aluno } from '../../../../models/alunos.model';
import { SalaAndar } from '../../../../models/sala-aula.model';
import { EventoService } from '../../../../services/evento.service';
import { AlunoService } from '../../../../services/alunos.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../../utils';
import moment from 'moment';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { RequestResponse } from '../../../../helpers/request-response.interface';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EventoAgendarFaltaRequest } from '../../../../models/evento-agendar-falta-request.model';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { showContatoFalta } from '../../../../utils/show-contato-falta';
import { EditarParticipacaoContatoComponent, EditarContatoView, EditarContatoTipo } from '../../editar-participacao-contato/editar-participacao-contato.component';
import { showEnviarMensagemAlunos } from '../../../../utils/show-enviar-mensagem-alunos';
import { MensagemTipo } from '../../enviar-mensagem-alunos/enviar-mensagem-alunos.component';
import { JornadaSuperaService } from '../../../../services/jornada-supera.service';
import { MonitoramentoService } from '../../../../services/monitoramento.service';

@Component({
	selector: 'app-agendar-falta',
	standalone: false,
	templateUrl: './agendar-falta.component.html',
	styleUrl: './agendar-falta.component.css',
	providers: [ConfirmationService]
})
export class AgendarFaltaComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;
	view = new AgendarFaltaView;

	evento?: Evento;
	aluno?: Aluno;
	participacao?: Evento_Participacao_Aluno;

	SalaAndar = SalaAndar;
	EventoTipo = EventoTipo;

	request = new EventoAgendarFaltaRequest;

	refChild: DynamicDialogRef | undefined;

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private eventoService: EventoService,
		private jornadaService: JornadaSuperaService,
		private monitoramentoService: MonitoramentoService,
		private alunoService: AlunoService,
		private toastrService: ToastrService,
		private confirmationService: ConfirmationService,
		private calendarioUtils: CalendarioUtils,
		private mensagemWhatsapp: MensagemWhatsapp,
	) {
		this.instance = this.dialogService.getInstance(this.ref);

		let evento = this.eventoService.getEvento().subscribe(res => this.evento = res);
		this.subscription.push(evento)

		let aluno = this.alunoService.getAluno().subscribe(res => this.aluno = res);
		this.subscription.push(aluno)
	}

	ngOnInit(): void {
		// this.instance = this.dialogService.getInstance(this.ref);
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
			this.evento = this.view.evento;
			this.aluno = this.view.aluno;

		}
		this.setParticipacao();
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

	setParticipacao() {
		if (this.evento && this.aluno) {
			this.participacao = this.evento.alunos.find(x => x.aluno_Id == this.aluno!.id);
		}
	}

	alunoChanged(aluno: Aluno) {
		if (!this.eventoService.getEvento().value) {
			this.evento = undefined;
		}
		this.aluno = aluno;
		this.setParticipacao();
	}

	eventoChanged(evento?: Evento) {
		this.evento = evento;
		this.eventoService.setEvento(evento);
		this.setParticipacao();
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
				message: `Tem certeza que deseja agendar falta para o aluno <b>${this.aluno.nome} </b> no dia <b>${data}</b>?`,
				header: 'Agendar falta',
				acceptIcon: 'pi pi-check',
				rejectIcon: 'pi pi-times',
				acceptLabel: 'Continuar',
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
		let response!: RequestResponse

		if (evento.id == PseudoEvento.EventoId) {
			response = await this.requestAulaTurma(evento);
			if (response.success) {
				evento = response.object;
			}
			else {
				this.loading = false;
				return this.showError(
					'Falta não agendada',
					`Ocorreu um erro ao agendar falta. <br> ${response.message}`,
					e,
				)
			}
		}

		this.participacao = evento.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

		let request: EventoAgendarFaltaRequest = {
			participacao_Id: this.participacao.id,
			statusContato_Id: this.request.statusContato_Id,
			observacao: this.request.observacao,
			contatoObservacao: this.request.contatoObservacao,
			alunoContactado: this.request.alunoContactado,
			reposicaoDe_Evento_Id: this.participacao.reposicaoDe_Evento_Id,
		};

		lastValueFrom(this.eventoService.cancelarParticipacao(request))
			.then(res => {
				if (res.success) {
					this.loading = false;
					this.jornadaService.onReload.emit(res.object.id);
					this.monitoramentoService.onReload.emit(res.object.id);
					this.eventoService.onReload.emit(res.object.id);
					this.toastrService.success(res.message);
					this.sendMensagemAluno(res.object);
				} else {
					this.loading = false;
					this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, res.message)
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

	sendMensagemAluno(evento: Evento) {
		if (this.aluno) {
			var aluno = this.aluno as Aluno;
			var ref = showEnviarMensagemAlunos(
				this.dialogService,
				[aluno],
				evento,
				MensagemTipo.FaltaAgendada
			)
			var onClose = ref.onClose.subscribe(res => {
				this.close();
			})
			this.subscription.push(onClose)
		}
		else {
			this.close();
		}

	}


	showContatoFalta() {
		if (this.evento && this.participacao) {
			this.refChild = showContatoFalta(
				this.dialogService,
				this.evento,
				this.participacao,
				EditarContatoTipo.FaltaAgendada
			);
			let onClose = this.refChild.onClose.subscribe(res => this.close())
			this.subscription.push(onClose);
		}
	}

}

export class AgendarFaltaView {
	aluno?: Aluno;
	evento?: Evento;
}