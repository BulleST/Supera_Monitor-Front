import { Component, OnInit } from '@angular/core';
import { Aluno } from '../../../models/alunos.model';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../utils';
import { ConfirmationService } from 'primeng/api';
import { showContatoFalta } from '../../../utils/show-contato-falta';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { EditarContatoTipo } from '../editar-participacao-contato/editar-participacao-contato.component';
import { EventoService } from '../../../services/evento.service';
import { CalendarioRequest } from '../../../models/calendario.model';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';
import { SalaAndar } from '../../../models/sala-aula.model';

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


	async loadSugestoes(aluno: Aluno) {
		var request: CalendarioRequest = {
			intervaloDe: this.evento.data,
			intervaloAte: moment(this.evento.data).add(1, 'month').toDate(),
			perfil_Cognitivo_Id: aluno.perfilCognitivo_Id
		}
		var response = await lastValueFrom(this.eventoService.getList(request))
		var list = response.eventos.filter(x => {
			const ativo = x.active;
			const temVagas = x.vagasDisponiveisEvento > 0;
			const alunoNoEvento = x.alunos.find(x => x.aluno_Id == aluno.id);
			const ehAula = x.evento_Tipo_Id == EventoTipo.Aula || x.evento_Tipo_Id == EventoTipo.TurmaExtra
			const perfilcompativel = aluno.perfilCognitivo_Id  || x.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)
			const aulaNaoFinalizada = !x.finalizado;
			const naoEhFeriado = !x.feriado;
			const salaValida = !aluno.restricaoMobilidade || x.andar == SalaAndar.Terreo;
			
			return ativo
				&& temVagas 
				&& !alunoNoEvento
				&& ehAula
				&& perfilcompativel
				&& aulaNaoFinalizada
				&& naoEhFeriado
				&& salaValida
		})
		return list;
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
		}
		else if (this.mensagemTipo == MensagemTipo.ConfirmacaoReposicao) {
			object = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.nome, aluno.celular, this.view.reposicaoDe!, this.view.reposicaoPara!);
		}
		else if (this.mensagemTipo == MensagemTipo.Inscricao) {
			object = this.mensagemWhatsapp.enviarMensagemInscricao(aluno.nome, aluno.celular, this.evento);
		}
		else if (this.mensagemTipo == MensagemTipo.Falta) {
				this.loadSugestoes(aluno)
					.then(sugestoes => {
						object = this.mensagemWhatsapp.enviarMensagemAgendamentoFalta(aluno.nome, aluno.celular, this.evento, sugestoes, true);
					})
		}
		else if (this.mensagemTipo == MensagemTipo.FaltaReposicao) {
			object = this.mensagemWhatsapp.enviarMensagemAgendamentoFalta(aluno.nome, aluno.celular, this.evento, [], false);
		}
		else if (this.mensagemTipo == MensagemTipo.FaltaAgendada) {
			var podeRemarcar = !participacao?.reposicaoDe_Evento_Id && !participacao?.reposicaoPara_Evento_Id;
			if (podeRemarcar) {
				this.loadSugestoes(aluno)
					.then(sugestoes => {
						object = this.mensagemWhatsapp.enviarMensagemAgendamentoFalta(aluno.nome, aluno.celular, this.evento, sugestoes, podeRemarcar);
					})
			}
			else {
			}
		}

		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);

		if (this.mensagemTipo == MensagemTipo.Cancelamento) {
			this.showContatoFalta(aluno, participacao!, EditarContatoTipo.Cancelamento);
		}
		else if (this.mensagemTipo == MensagemTipo.FaltaAgendada) {
			this.showContatoFalta(aluno, participacao!, EditarContatoTipo.FaltaAgendada);
		}
		else {
			this.removeItemLista(aluno);
		}
		return object;
	}

	removeItemLista(aluno: Aluno) {
		let index = this.alunos.findIndex(x => x.id == aluno.id)
		if (index != -1)
			this.alunos.splice(index, 1);
	}

	showContatoFalta(aluno: Aluno, participacao: Evento_Participacao_Aluno, tipo: EditarContatoTipo) {

		var ref = showContatoFalta(this.dialogService, this.evento, participacao, tipo);
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