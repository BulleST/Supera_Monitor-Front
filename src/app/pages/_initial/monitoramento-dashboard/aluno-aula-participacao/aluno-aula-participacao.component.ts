import { Component, OnInit } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Item } from '../../../../models/dashboard.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import moment from 'moment';
import { SalaAndar } from '../../../../models/sala-aula.model';

@Component({
	selector: 'app-aluno-aula-participacao',
	standalone: false,
	templateUrl: './aluno-aula-participacao.component.html',
	styleUrl: './aluno-aula-participacao.component.css'
})
export class AlunoAulaParticipacaoComponent implements OnInit {
	item!: Dashboard_Item;
	aluno!: Dashboard_Aluno;

	loading = true;
	instance: DynamicDialogComponent | undefined;
	refChild: DynamicDialogRef | undefined;

	hoje = new Date;
	SalaAndar = SalaAndar;

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
}
