import { Component, OnInit } from '@angular/core';
import { Aluno } from '../../../models/alunos.model';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../utils';
import { ConfirmationService } from 'primeng/api';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { EventoService } from '../../../services/evento.service';
import { showContato } from '../../../utils/show-contato';

@Component({
	selector: 'app-enviar-mensagem-alunos',
	standalone: false,
	templateUrl: './enviar-mensagem-alunos.component.html',
	styleUrl: './enviar-mensagem-alunos.component.css',
	providers: [ConfirmationService],
})
export class EnviarMensagemAlunosComponent implements OnInit {
	alunos: Aluno[] = [];
	evento!: Evento;
	instance: DynamicDialogComponent | undefined;
	tipoString = '';
	mensagemTipo!: MensagemTipo;
	view = new EnviarMensagemAlunosView;
	MensagemTipo = MensagemTipo;

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private calendarioUtils: CalendarioUtils,
		public mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,
		private eventoService: EventoService,

	) {

		this.instance = this.dialogService.getInstance(this.ref);

	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
			this.evento = this.view.evento;
			this.alunos = this.view.alunos;
			this.mensagemTipo = this.view.tipo;
			this.tipoString = this.calendarioUtils.getEventoTipo(this.evento);
		}
	}

	close() {
		this.ref.close();
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage);
	}

	enviarMensagem(aluno: Aluno) {
		var participacao = this.view.participacao;

		if (!aluno.celular) {
			this.showError('Erro', 'Nenhum celular cadastrado', aluno);
			return;
		}

		let object = { link: '', mensagem: '' };

		if (this.mensagemTipo == MensagemTipo.Agendamento) {
			object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, this.evento);
		}
		else if (this.mensagemTipo == MensagemTipo.Cancelamento) {
			object = this.mensagemWhatsapp.enviarMensagemCancelamento(aluno.nome, aluno.celular, this.evento);
			this.showContato(aluno, participacao!);
		}
		else if (this.mensagemTipo == MensagemTipo.ConfirmacaoReposicao) {
			object = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.nome, aluno.celular, this.view.reposicaoDe!, this.view.reposicaoPara!);
		}
		else if (this.mensagemTipo == MensagemTipo.Inscricao) {
			object = this.mensagemWhatsapp.enviarMensagemInscricao(aluno.nome, aluno.celular, this.evento);
		}
		else if (this.mensagemTipo == MensagemTipo.Falta) {
			this.showContato(aluno, participacao!);
		}
		else if (this.mensagemTipo == MensagemTipo.FaltaReposicao) {
			this.showContato(aluno, participacao!);
		}
		else if (this.mensagemTipo == MensagemTipo.FaltaAgendada) {
			this.showContato(aluno, participacao!);
			
		}

		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
		this.removeItemLista(aluno);

		

		return object;
	}

	removeItemLista(aluno: Aluno) {
		let index = this.alunos.findIndex(x => x.id == aluno.id)
		if (index != -1)
			this.alunos.splice(index, 1);
	}

	showContato(aluno: Aluno, participacao: Evento_Participacao_Aluno) {

		var ref = showContato(this.dialogService, this.evento, participacao);
		var onClose = ref.onClose.subscribe(res => {
			this.removeItemLista(aluno);
			if (this.alunos.length == 0) {
				this.close();
			}
		});
	}

}

export class EnviarMensagemAlunosView {
	evento: Evento = new Evento;
	alunos: Aluno[] = [];
	tipo: MensagemTipo = MensagemTipo.Agendamento;
	reposicaoDe?: Evento;
	reposicaoPara?: Evento;
    participacao?: Evento_Participacao_Aluno
}

export enum MensagemTipo {
	Agendamento,
	Inscricao,
	Cancelamento,
	ConfirmacaoReposicao,
	FaltaAgendada,
	Falta,
	FaltaReposicao,
	ReposicaoDesmarcada,
}