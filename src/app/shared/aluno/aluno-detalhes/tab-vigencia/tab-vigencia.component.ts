import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { FilterMatchMode } from 'primeng/api';
import { AlunoService } from '../../../../services/alunos.service';
import { Aluno_Vigencia } from '../../../../models/aluno-vigencia.model';
import { lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-tab-vigencia',
	standalone: false,
	templateUrl: './tab-vigencia.component.html',
	styleUrl: './tab-vigencia.component.css'
})
export class TabVigenciaComponent implements OnChanges {

	@Input() object: Aluno = new Aluno;
	@Input() aluno_Id!: number;
	@Output() atualizar = new EventEmitter<boolean>();

	loading = false;
	FilterMathMode = FilterMatchMode;
	list: Aluno_Vigencia[] = [];


	constructor(
		private service: AlunoService
	) {
		this.atualizar.subscribe(res => this.update())
		this.service.vigencia.subscribe(res => this.list = res);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['aluno_Id']) {
			this.aluno_Id = changes['aluno_Id'].currentValue;
			this.update();
		}
		if (changes['object']) {
			this.object = changes['object'].currentValue;
		}
	}

	update() {
		if (this.aluno_Id) {
			this.loading = true;
			this.list = []
			lastValueFrom(this.service.getVigencia(this.aluno_Id))
				.then(res => {
					this.loading = false;
				})
				.catch(res => {
					this.loading = false;
				})
		}
	}
}

