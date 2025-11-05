import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Roteiro } from '../../../models/roteiro.model';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarioUtils, getError, MensagemWhatsapp, showError } from '../../../utils';
import { PseudoEvento } from '../../../models/reposicao.model';
import { Evento } from '../../../models/evento.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { RoteiroService } from '../../../services/roteiro.service';
import { statusContato } from '../../../models/evento-participacao-aluno.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MonitoramentoService } from '../../../services/monitoramento.service';

@Component({
	selector: 'app-aluno-contato-falta',
	standalone: false,
	templateUrl: './aluno-contato-falta.component.html',
	styleUrl: './aluno-contato-falta.component.css',
	providers: [ConfirmationService]
})
export class AlunoContatoFaltaComponent {
	evento_Id: number = 0;
	participacao_Id: number = 0;
	celular?: string;
	aluno: string = '';
	evento: string = '';
	data: Date = new Date;
	observacao?: string;
	roteiroCorLegenda?: string;
	semana?: string;
	tema?: string;
	
	contatado = false;
	contatoObservacao?: string;
	alunoContactado?: Date;
	statusContato_Id?: number;
	status = statusContato;
	
	passado = false;
	loading = false;
	instance: DynamicDialogComponent | undefined;

	constructor(
		private dialogService: DialogService,
		private mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,
		private toastr: ToastrService,
		private ref: DynamicDialogRef,
		private monitoramentoService: MonitoramentoService,
		private eventoService: EventoService,
		
	) {
		this.instance = this.dialogService.getInstance(this.ref);
	}

	
	ngOnInit(): void {
		if (this.instance && this.instance.data) {

			this.evento_Id = this.instance.data['evento_Id'];
			this.participacao_Id = this.instance.data['participacao_Id'];
			this.celular = this.instance.data['celular'];
			this.aluno = this.instance.data['aluno'];
			this.evento = this.instance.data['evento'];
			this.data = this.instance.data['data'];
			this.observacao = this.instance.data['observacao'];
			this.roteiroCorLegenda = this.instance.data['roteiroCorLegenda'];
			this.semana = this.instance.data['semana'];
			this.tema = this.instance.data['tema'];
			this.contatoObservacao = this.instance.data['contatoObservacao'];
			this.alunoContactado = this.instance.data['alunoContactado'];
			this.statusContato_Id = this.instance.data['statusContato_Id'];
			
			this.contatado = !!this.alunoContactado;
			this.passado = moment().isSameOrBefore(this.data);
		}
	}

	close() {
		this.ref.close();
	}

	alunoContactadoChanged() {
		this.contatado = !this.contatado;
		if (!this.contatado) {
			this.alunoContactado = undefined;
			this.statusContato_Id = undefined;
		}
		else {
			this.alunoContactado = new Date;
		}
	}

	async enviarMensagemFalta(e: any) {
		let evento = await lastValueFrom(this.eventoService.get(this.evento_Id));
		let participacao = evento.alunos.find(x => x.id == this.participacao_Id);
		if (evento && participacao) {
			this.mensagemWhatsapp.enviarMensagemFalta(evento, participacao, e);
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

		const data = moment(this.data).format('DD/MM/YY [às] HH[h]mm');

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

		let request = {
			participacao_Id: this.participacao_Id,
			observacao: this.observacao,
			contatoObservacao: this.contatoObservacao,
			alunoContactado: this.alunoContactado,
			statusContato_Id: this.statusContato_Id,
		}
		await lastValueFrom(this.eventoService.atualizarParticipacao(request))
			.then(res => {
				this.loading = false;
				if (res.success) {
					this.monitoramentoService.onReload.emit(true);
					this.eventoService.calendarioReload.emit(res.object.id);
					this.toastr.success(`Status atualizado com sucesso`);
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

}