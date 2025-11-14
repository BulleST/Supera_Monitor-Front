import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';

import { Evento } from '../../../../../models/evento.model';
import { CalendarioUtils, getError, showError } from '../../../../../utils';
import { EventoService } from '../../../../../services/evento.service';
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model';
import { PseudoEvento, ReposicaoRequest } from '../../../../../models/reposicao.model';
import { RequestResponse } from '../../../../../helpers/request-response.interface';
import { showEnviarMensagemAlunos } from '../../../../../utils/show-enviar-mensagem-alunos';
import { MensagemTipo } from '../../../enviar-mensagem-alunos/enviar-mensagem-alunos.component';
import { Aluno } from '../../../../../models/alunos.model';
import { MonitoramentoService } from '../../../../../services/monitoramento.service';
import { JornadaSuperaService } from '../../../../../services/jornada-supera.service';

@Component({
	selector: 'app-reposicao-confirm',
	standalone: false,
	templateUrl: './reposicao-confirm.component.html',
	styleUrl: './reposicao-confirm.component.css',
	providers: [ConfirmationService]
})
export class ReposicaoConfirmComponent implements OnInit {
	instance: DynamicDialogComponent | undefined;
	loading = false;
	view = new AgendarReposicaoConfirmView;

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private confirmationService: ConfirmationService,
		private toastr: ToastrService,
		private eventoService: EventoService,
		private jornadaService: JornadaSuperaService,
		private monitoramentoService: MonitoramentoService,
		private calendarioUtils: CalendarioUtils,

	) {

		this.instance = this.dialogService.getInstance(this.ref);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {

			this.view = this.instance.data['view'];
		}
	}
	showError(header: string, message: string, e: any, error: any) {
		showError(this.confirmationService, header, message, e, error.toString());
	}


	close(cancelarReposicao: boolean) {
		this.ref.close(cancelarReposicao);
	}


	async send(e: any) {
		this.loading = true;

		var reposicaoPara = this.view.reposicaoPara;
		var reposicaoDe = this.view.reposicaoDe;
		var participacao = this.view.participacao;

		let request = new ReposicaoRequest;
		request.aluno_Id = participacao.aluno_Id;
		request.source_Aula_Id = reposicaoDe.id;
		request.dest_Aula_Id = reposicaoPara.id;
		request.observacao = this.view.observacaoReposicao;
		let response: RequestResponse = { success: true, message: '', object: undefined };

		// Se a aula source não existir, cria a aula
		if (request.source_Aula_Id == PseudoEvento.EventoId) {
			response = await this.requestAulaTurma(reposicaoDe)
			request.source_Aula_Id = response.object.id;
			if (!response.success) {
				return this.showError(
					'Reposição não agendada',
					`Ocorreu um erro ao agendar reposição. <br> ${response.message}`,
					e,
					null);
			}
		}

		// Se a aula target não existir, cria a aula
		if (request.dest_Aula_Id == PseudoEvento.EventoId) {
			response = await this.requestAulaTurma(reposicaoPara)
			request.dest_Aula_Id = response.object.id;
			if (!response.success) {

				return this.showError(
					'Reposição não agendada',
					`Ocorreu um erro ao agendar reposição. <br> ${response.message}`,
					e,
					null);
			}
		}

		await lastValueFrom(this.eventoService.reposicao(request))
			.then(res => {
				this.loading = false;
				if (res.success) {
					this.jornadaService.onReload.emit(res.object.id);
					this.monitoramentoService.onReload.emit(res.object.id);
					this.eventoService.onReload.emit(res.object.id);
					this.sendMensagemAluno(res.object);
					var data = moment(reposicaoPara.data).format('DD/MM/YYYY [às] HH[h]mm');
					this.toastr.success(`Reposição agendada para o dia ${data}`);
					this.close(false);
				}
				else {

					this.showError(
						'Reposição não agendada',
						`Ocorreu um erro ao agendar reposição. <br> ${res.message}`,
						e,
						null);
				}
			})
			.catch(res => {
				this.loading = false;

				return this.showError(
					'Reposição não agendada',
					`Ocorreu um erro ao agendar reposição. <br> ${res.message}`,
					e,
					getError(res));
			})
	}

	sendMensagemAluno(evento: Evento) {

		if (this.view.participacao.celular) {
			
			var ref = showEnviarMensagemAlunos(this.dialogService, 
				[this.view.aluno], 
				evento, 
				MensagemTipo.ConfirmacaoReposicao,
				this.view.reposicaoDe,
				this.view.reposicaoPara,
				this.view.participacao
			);
			ref.onClose.subscribe(res => {
				this.close(false)
			})

		
		}
	}

	requestAulaTurma(evento: Evento) {
		return this.calendarioUtils.requestAulaTurma(evento);
	}
}

export class AgendarReposicaoConfirmView {
	reposicaoDe: Evento = new Evento;
	reposicaoPara: Evento = new Evento;
	participacao: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
	aluno: Aluno = new Aluno;
	observacaoReposicao: string = '';
}