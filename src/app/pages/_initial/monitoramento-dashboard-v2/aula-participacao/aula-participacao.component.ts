import { Component, OnInit } from '@angular/core';
import { Dashboard_Item } from '../../../../models/dashboard.model';
import { Dashboard_Aluno, Dashboard_Aluno_Aula_Reposicao, Dashboard_Item_Status } from '../../../../models/dashboard-v2.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SalaAndar } from '../../../../models/sala-aula.model';
import { AlunoContatoFaltaComponent } from '../../../../shared/aluno/aluno-contato-falta/aluno-contato-falta.component';
import moment from 'moment';

@Component({
	selector: 'app-aula-participacao',
	standalone: false,
	templateUrl: './aula-participacao.component.html',
	styleUrl: './aula-participacao.component.css'
})
export class AulaParticipacaoComponent implements OnInit {
	item!: Dashboard_Aluno_Aula_Reposicao;
	aluno!: Dashboard_Aluno;

	loading = true;
	instance: DynamicDialogComponent | undefined;
	refChild: DynamicDialogRef | undefined;

	hoje = new Date;
	SalaAndar = SalaAndar;
	Dashboard_Item_Status = Dashboard_Item_Status;




	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef
	) {
		this.instance = this.dialogService.getInstance(this.ref);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.aluno = this.instance.data['aluno'];
			this.item = this.instance.data['item'];
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
				alunoContactado: this.item.aula.participacao.alunoContactado ? moment(this.item.aula.participacao.alunoContactado).toDate(): undefined, 
				statusContato_Id: this.item.aula.participacao.statusContato_Id,
				contatoObservacao: this.item.aula.participacao.contatoObservacao,
				participacao_Id: this.item.aula.participacao.id,
			}
		});
	}
}