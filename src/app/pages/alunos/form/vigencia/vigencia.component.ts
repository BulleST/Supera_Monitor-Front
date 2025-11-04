import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { FilterMatchMode } from 'primeng/api';
import { Aluno_Vigencia } from '../../../../models/aluno-vigencia.model';
import { AlunoService } from '../../../../services/alunos.service';
import { lastValueFrom } from 'rxjs';
import moment from 'moment';

@Component({
	selector: 'app-vigencia',
	standalone: false,
	templateUrl: './vigencia.component.html',
	styleUrl: './vigencia.component.css'
})
export class VigenciaComponent implements OnChanges {

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
		if (this.object.id) {
			this.loading = true;
			lastValueFrom(this.service.getVigencia(this.aluno_Id))
				.then(res => {
					this.loading = false;
					this.list = res;
					console.log(this.list)
				})
				.catch(res => {
					this.loading = false;
				})
		}
	}
}
