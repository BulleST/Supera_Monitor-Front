import { Component, OnInit } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Aluno_Aula_Reposicao, Dashboard_Aula, Dashboard_Aula_Participacao, Dashboard_Item_Status, Dashboard_Participacao } from '../../../models/dashboard.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SalaAndar } from '../../../models/sala-aula.model';
import { AlunoContatoFaltaComponent } from '../../../shared/aluno/aluno-contato-falta/aluno-contato-falta.component';
import moment from 'moment';
import { PseudoEvento } from '../../../models/reposicao.model';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Crypto } from '../../../utils';
import { AlunoService } from '../../../services/alunos.service';

@Component({
	selector: 'app-aula-participacao',
	standalone: false,
	templateUrl: './aula-participacao.component.html',
	styleUrl: './aula-participacao.component.css'
})
export class AulaParticipacaoComponent implements OnInit {
	item!: Dashboard_Aluno_Aula_Reposicao;
	aluno!: Dashboard_Aluno;
	aula!: Dashboard_Aula;
	participacao!: Dashboard_Participacao;
	reposicaoPara?: Dashboard_Aula_Participacao;

	loading = true;
	instance: DynamicDialogComponent | undefined;
	refChild: DynamicDialogRef | undefined;

	hoje = new Date;
	SalaAndar = SalaAndar;
	Dashboard_Item_Status = Dashboard_Item_Status;

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

	close() {
		this.ref.close();
	}

	showContatoFalta() {
		this.refChild = this.dialogService.open(AlunoContatoFaltaComponent, {
			header: 'Aula',
			showHeader: false,
			closable: true,
			maximizable: false,
			closeOnEscape: true,
			draggable: true,
			dismissableMask: true,
			duplicate: true,
			modal: true,
			width: '95vw',
			style: { maxWidth: '550px' },
			data: {
				celular: this.aluno.celular,
				aluno: this.aluno.nome,

				evento_Id: this.item.aula.aula.id,
				evento: this.item.aula.aula.descricao,
				data: this.item.aula.aula.data,
				roteiroCorLegenda: this.item.aula.aula.roteiroCorLegenda,
				semana: this.item.aula.aula.semana,
				tema: this.item.aula.aula.tema,

				observacao: this.item.aula.participacao.observacao,
				contatado: this.item.aula.participacao.alunoContactado,
				alunoContactado: this.item.aula.participacao.alunoContactado ? moment(this.item.aula.participacao.alunoContactado).toDate() : undefined,
				statusContato_Id: this.item.aula.participacao.statusContato_Id,
				contatoObservacao: this.item.aula.participacao.contatoObservacao,
				participacao_Id: this.item.aula.participacao.id,
			}
		});
	}


	async goToAula() {
		let evento = await this.getAula().catch(res => { this.toastr.error(res.message, 'Erro') })
		if (evento) {

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
			this.router.navigate(['monitoramento', 'aula', this.crypto.encrypt(evento.id)]);
		}
	}

	async goToAgendarFalta() {
		let evento = await this.getAula().catch(res => { this.toastr.error(res.message, 'Erro') })
		if (evento) {
			let aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
			this.eventoService.setEvento(evento);
			this.alunoService.setAluno(aluno);
			this.router.navigate(['monitoramento', 'agendar-falta', this.crypto.encrypt(evento.id)])
		}
	}

	async goToReposicao() {
		let evento = await this.getAula().catch(res => { this.toastr.error(res.message, 'Erro') })
		if (evento) {
			let aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
			this.eventoService.setEventoReposicaoDe(evento);
			this.alunoService.setAluno(aluno)
			this.router.navigate(['monitoramento', 'reposicao', 'agendar', this.crypto.encrypt(this.aluno.id), this.crypto.encrypt(evento.id)])
		}
	}

	getAula() {
		if (this.item.aula.aula.id == PseudoEvento.EventoId)
			return lastValueFrom(this.eventoService.getPseudoAula(this.aluno.turma_Id, this.item.aula.aula.data))
		return lastValueFrom(this.eventoService.get(this.item.aula.aula.id))
	}
}