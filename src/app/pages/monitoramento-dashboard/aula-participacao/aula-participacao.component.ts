import { Component, OnInit } from '@angular/core';
import { Monitoramento_Aluno, Monitoramento_Aluno_Item, Monitoramento_Aula, Monitoramento_Aula_Participacao_Rel, Monitoramento_Item_Status, Monitoramento_Participacao } from '../../../models/monitoramento.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SalaAndar } from '../../../models/sala-aula.model';
import { PseudoEvento } from '../../../models/reposicao.model';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Crypto } from '../../../utils';
import { AlunoService } from '../../../services/alunos.service';
import { showAluno } from '../../../utils/show-aluno';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { Aluno } from '../../../models/alunos.model';
import { showContatoFalta } from '../../../utils/show-contato-falta';
import { EditarContatoTipo } from '../../../shared/evento/editar-participacao-contato/editar-participacao-contato.component';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';

@Component({
	selector: 'app-aula-participacao',
	standalone: false,
	templateUrl: './aula-participacao.component.html',
	styleUrl: './aula-participacao.component.css',
})
export class AulaParticipacaoComponent implements OnInit {
	item!: Monitoramento_Aluno_Item;
	aluno!: Monitoramento_Aluno;
	aula!: Monitoramento_Aula;
	participacao!: Monitoramento_Participacao;
	reposicaoPara?: Monitoramento_Aula_Participacao_Rel;

	eventoCalendario!: Evento
	alunoList!: Aluno

	loading = true;
	instance: DynamicDialogComponent | undefined;
	refChild: DynamicDialogRef | undefined;

	hoje = new Date;
	SalaAndar = SalaAndar;
	Monitoramento_Item_Status = Monitoramento_Item_Status;
	EventoTipo = EventoTipo;

	constructor(
		private alunoService: AlunoService,
		private eventoService: EventoService,
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private toastr: ToastrService,
		private router: Router,
		private crypto: Crypto,

	) {
		this.instance = this.dialogService.getInstance(this.ref);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.aluno = this.instance.data['aluno'];
			this.item = this.instance.data['item'];
			this.aula = this.item.aula.aula;
			this.participacao = this.item.aula.participacao;
			this.reposicaoPara = this.item.reposicaoPara;
		}
	}

	loadEvento() {
		return this.getAula()
			.then(res => this.eventoCalendario = res)
			.catch(res => {
				this.toastr.error(res.message, 'Erro')
				return res;
			})
	}

	loadAluno() {
		return lastValueFrom(this.alunoService.get(this.aluno.id))
			.then(res => this.alunoList = res)
			.catch(res => {
				this.toastr.error(res.message, 'Erro')
				return res;
			})
	}

	close() {
		this.router.navigate(['monitoramento'])
		this.ref.close();
	}

	async goToAula() {
		if (!this.eventoCalendario)
			await this.loadEvento();
		let evento = this.eventoCalendario;

		if (evento.alunos && evento.alunos.length) {
			evento.alunos = evento.alunos.map(x => {
				if (!evento!.finalizado) {
					if (x.presente !== true && x.presente !== false) {
						x.presente = true;
					}
				}
				return x
			});
		}

		if (evento.professores && evento.professores.length) {
			evento.professores = evento.professores.map(x => {
				x.presente = evento!.finalizado ? x.presente : true;
				return x
			})
		}
		this.eventoService.setEvento(evento);
		this.router.navigate(['monitoramento', 'aula', 'finalizar', 'aula', this.crypto.encrypt(evento.id)]);
	}

	async goToAgendarFalta() {
		var reqs = [];
		if (!this.eventoCalendario) reqs.push(this.loadEvento())
		if (!this.alunoList) reqs.push(this.loadAluno())

		await Promise.all(reqs)

		this.eventoService.setEvento(this.eventoCalendario);
		this.alunoService.setAluno(this.alunoList);
		
		this.router.navigate(['monitoramento', 'aula', 'agendar', 'falta'], {
                queryParams: {
                    evento_id: this.crypto.encrypt(this.eventoCalendario.id),
                    aluno_id: this.crypto.encrypt(this.alunoList.id),
                }
            });
	}

	async goToAgendarReposicao() {
		var reqs = [];
		if (!this.eventoCalendario) reqs.push(this.loadEvento())
		if (!this.alunoList) reqs.push(this.loadAluno())

		await Promise.all(reqs)

		this.eventoService.setEventoReposicaoDe(this.eventoCalendario);
		this.alunoService.setAluno(this.alunoList)

		this.router.navigate(['monitoramento', 'aula', 'agendar', 'reposicao'], {
			queryParams: {
				evento_reposicao_de: this.crypto.encrypt(this.eventoCalendario.id),
				aluno_id: this.crypto.encrypt(this.aluno.id),
			}
		})
	}

	async goToPrimeiraAula() {
		var reqs = [];
		if (!this.eventoCalendario) reqs.push(this.loadEvento())
		if (!this.alunoList) reqs.push(this.loadAluno())

		await Promise.all(reqs)

		this.eventoService.setEvento(this.eventoCalendario);
		this.alunoService.setAluno(this.alunoList);

		this.router.navigate(['monitoramento', 'aula', 'agendar', 'primeira-aula'], {
                queryParams: {
                    evento_id: this.crypto.encrypt(this.eventoCalendario.id),
                    aluno_id: this.crypto.encrypt(this.alunoList.id),
                }
            });
	}

	getAula() {
		let aula = this.item.aula.aula;
		if (this.item.reposicaoPara) {
			aula = this.item.reposicaoPara.aula;
		}
		if (aula.id == PseudoEvento.EventoId)
			return lastValueFrom(this.eventoService.getPseudoAula(this.aluno.turma_Id, aula.data))
		return lastValueFrom(this.eventoService.get(aula.id))
	}

	showAluno() {
		showAluno(this.dialogService, this.aluno.id)
	}

	async showContatoFalta () {
		if (!this.eventoCalendario)
			await this.loadEvento();

		var participacao = this.eventoCalendario.alunos.find(x => x.aluno_Id == this.aluno.id) as Evento_Participacao_Aluno;


		var tipo = EditarContatoTipo.Cancelamento;
		if (this.item.status == Monitoramento_Item_Status.ReposicaoAgendada)
			tipo = EditarContatoTipo.ReposicaoAgendada;
		if (this.item.status == Monitoramento_Item_Status.ReposicaoDesmarcada)
			tipo = EditarContatoTipo.ReposicaoAgendada;
		if (this.item.status == Monitoramento_Item_Status.FaltaAgendada)
			tipo = EditarContatoTipo.FaltaAgendada;
		if (this.item.status == Monitoramento_Item_Status.FaltaReposicao)
			tipo = EditarContatoTipo.FaltaReposicao;
		if (this.item.status == Monitoramento_Item_Status.FaltaAula)
			tipo = EditarContatoTipo.Falta;
		showContatoFalta(this.dialogService, this.eventoCalendario, participacao, tipo)
	}
}