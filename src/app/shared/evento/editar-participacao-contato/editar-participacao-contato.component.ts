import { Component, OnDestroy, OnInit } from '@angular/core';
import { Evento_Participacao_Aluno, statusContato, UpdateParticipacaoAlunoRequest } from '../../../models/evento-participacao-aluno.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarioUtils, getError, MensagemWhatsapp, showError } from '../../../utils';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { EventoService } from '../../../services/evento.service';
import moment from 'moment';
import { Evento } from '../../../models/evento.model';
import { NgForm } from '@angular/forms';
import { MonitoramentoService } from '../../../services/monitoramento.service';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';

@Component({
	selector: 'app-editar-participacao-contato',
	standalone: false,
	templateUrl: './editar-participacao-contato.component.html',
	styleUrl: './editar-participacao-contato.component.css',
	providers: [ConfirmationService]
})
export class EditarParticipacaoContatoComponent implements OnInit, OnDestroy {

	subscription: Subscription[] = [];
	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;

	view = new EditarContatoView;
	evento!: Evento;
	participacao!: Evento_Participacao_Aluno;
	tipo!: EditarContatoTipo;

	alunoContactado: boolean = false;
	passado: boolean = false;
	status = statusContato;

	EditarContatoTipo = EditarContatoTipo;


	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,

		private eventoService: EventoService,
		private jornadaService: JornadaSuperaService,
		private monitoramentoService: MonitoramentoService,
		private mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,
		private calendarioUtils: CalendarioUtils,
		private toastr: ToastrService,
	) {

		this.instance = this.dialogService.getInstance(this.ref);

	}


	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
			this.evento = this.view.evento;
			this.participacao = this.view.participacao;
			this.tipo = this.view.tipo;
			this.alunoContactado = !!this.participacao.alunoContactado;

			if (this.tipo == EditarContatoTipo.Cancelamento) {
				this.participacao.observacao = 'Aula Cancelada';
			}
			else if (this.tipo == EditarContatoTipo.FaltaAgendada && !this.participacao.observacao) {
				this.participacao.observacao = 'Falta agendada';
			}
			else if (this.tipo == EditarContatoTipo.Falta && !this.participacao.observacao) {
				// this.participacao.observacao = 'Aluno faltou';
			}

		}
	}
	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	close() {
		this.ref.close();
	}

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}

	alunoContactadoChanged() {
		this.alunoContactado = !this.alunoContactado;
		if (!this.alunoContactado) {
			this.participacao.alunoContactado = undefined;
			this.participacao.statusContato_Id = undefined;
		}
		else {
			this.participacao.alunoContactado = new Date;
		}
	}

	enviarMensagemFalta(e: any) {
		if (this.evento && this.participacao) {
			this.mensagemWhatsapp.enviarMensagemFalta(this.evento, this.participacao, e);
		}
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage);
	}

	sendConfirmation(form: NgForm, e: any) {

		if (!form.valid) {
			this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e);
			this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
			return;
		}

		// playAlert();

		const data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');

		this.confirmationService.confirm({
			target: e.target,
			message: `Tem certeza que deseja salvar o status de contato?`,
			header: 'Status de contato',
			acceptIcon: 'pi pi-check',
			rejectIcon: 'pi pi-times',
			acceptLabel: 'Salvar',
			rejectLabel: 'Cancelar',
			acceptButtonStyleClass: 'p-button-rounded',
			rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
			accept: () => {
				this.send(e);
			},
			reject: () => {
			}
		});
	}

	async send(e: any) {

		this.loading = true;

		let request: UpdateParticipacaoAlunoRequest = {
			participacao_Id: this.participacao.id,
			presente: this.participacao.presente,
			observacao: this.participacao.observacao,
			apostila_Abaco_Id: this.participacao.apostila_Abaco_Id,
			apostila_AH_Id: this.participacao.apostila_AH_Id,
			numeroPaginaAbaco: this.participacao.numeroPaginaAbaco,
			numeroPaginaAH: this.participacao.numeroPaginaAH,
			reposicaoDe_Evento_Id: this.participacao.reposicaoDe_Evento_Id,
			deactivated: this.participacao.deactivated,
			contatoObservacao: this.participacao.contatoObservacao,
			alunoContactado: this.participacao.alunoContactado,
			statusContato_Id: this.participacao.statusContato_Id,
		}
		await lastValueFrom(this.eventoService.atualizarParticipacao(request))
			.then(res => {
				this.loading = false;
				if (res.success) {
					this.jornadaService.onReload.emit(res.object.id);
					this.monitoramentoService.onReload.emit(res.object.id);
					this.eventoService.onReload.emit(res.object.id);
					this.toastr.success(`Status atualizado com sucesso`)
					this.close();
				}
				else {
					this.showError('Erro', `Não foi possível atualizar status. <br> ${res.message}`, e)
				}
			})
			.catch(res => {
				this.loading = false;
				this.showError('Erro', `Não foi possível atualizar status. <br> ${getError(res)}`, e)
			})
	}

	requestAulaTurma(evento: Evento) {
		return this.calendarioUtils.requestAulaTurma(evento);
	}

}

export class EditarContatoView {
	participacao = new Evento_Participacao_Aluno;
	evento = new Evento;
	tipo = EditarContatoTipo.Falta;
}

export enum EditarContatoTipo {
	Cancelamento,
	Falta,
	FaltaAgendada,
	FaltaReposicao,
	ReposicaoAgendada,
	ReposicaoDesmarcada,
}