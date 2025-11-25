import { Component, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Evento } from '../../../../models/evento.model';
import { Evento_Participacao_Aluno, statusContato } from '../../../../models/evento-participacao-aluno.model';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { NgModel } from '@angular/forms';
import { SelectChangeEvent } from 'primeng/select';

@Component({
	selector: 'app-table',
	standalone: false,
	templateUrl: './table.component.html',
	styleUrl: './table.component.css'
})
export class TableComponent implements OnChanges {

	@Input() evento!: Evento;
	@Input() readonly: boolean = false;
	
	@Output() onEnviarMensagem = new EventEmitter<Evento_Participacao_Aluno>()
	@Output() onEnviarMensagemFalta = new EventEmitter<{ participacao: Evento_Participacao_Aluno, event: any }>()
	@Output() onShowAluno = new EventEmitter<Evento_Participacao_Aluno>()
	@Output() onPresente = new EventEmitter<Evento_Participacao_Aluno>()
	@Output() onShowContatoFalta = new EventEmitter<Evento_Participacao_Aluno>()
	@Output() onInputFocus = new EventEmitter<Evento_Participacao_Aluno>()
	
	@Output() onApostilaAbacoChange = new EventEmitter<{ participacao: Evento_Participacao_Aluno, event: SelectChangeEvent }>()
	@Output() onNumeroPaginaAbacoChange = new EventEmitter<{ participacao: Evento_Participacao_Aluno, event: any, ngModel: NgModel }>()
	@Output() onApostilaAbacoClick = new EventEmitter<Evento_Participacao_Aluno>()
	
	@Output() onApostilaAHChange = new EventEmitter<{ participacao: Evento_Participacao_Aluno, event: SelectChangeEvent }>()
	@Output() onNumeroPaginaAHChange = new EventEmitter<{ participacao: Evento_Participacao_Aluno, event: any, ngModel: NgModel }>()
	@Output() onApostilaAHClick = new EventEmitter<Evento_Participacao_Aluno>()
	
	@ViewChildren('presencaButton') presencaButton!: QueryList<Button>;
	@ViewChildren('apostilaAbacoInput') apostilaAbacoInput!: QueryList<InputNumber>;
	@ViewChildren('apostilaAHInput') apostilaAHInput!: QueryList<InputNumber>;
	
	statusContato = statusContato;
	
	constructor(
	) {

	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['evento']) this.evento = changes['evento'].currentValue;
		if (changes['readonly']) this.readonly = changes['readonly'].currentValue;
	}

	enviarMensagem(participacao: Evento_Participacao_Aluno) {
		this.onEnviarMensagem.emit(participacao);
	}

	enviarMensagemFalta(participacao: Evento_Participacao_Aluno, e: any) {
		this.onEnviarMensagemFalta.emit({ participacao, event: e });
	}

	showAluno(participacao: Evento_Participacao_Aluno) {
		this.onShowAluno.emit(participacao);
	}

	contatoToggle(participacao: Evento_Participacao_Aluno) {
		this.onShowContatoFalta.emit(participacao);
	}

	inputFocus(participacao: Evento_Participacao_Aluno) {
		this.onInputFocus.emit(participacao);
	}


	apostilaAbacoChange(participacao: Evento_Participacao_Aluno, event: SelectChangeEvent) {
		this.onApostilaAbacoChange.emit({
			participacao,
			event,
		})
	}

	numeroPaginaAbacoChange(participacao: Evento_Participacao_Aluno, event: any, ngModel: NgModel) {
		this.onNumeroPaginaAbacoChange.emit({
			participacao,
			event,
			ngModel,
		})
	}

	apostilaAbacoClick(participacao: Evento_Participacao_Aluno) {
		this.onApostilaAbacoClick.emit(participacao);
	}
	
	
	apostilaAHChange(participacao: Evento_Participacao_Aluno, event: SelectChangeEvent) {
		this.onApostilaAHChange.emit({
			participacao,
			event,
		})
	}

	numeroPaginaAHChange(participacao: Evento_Participacao_Aluno, event: any, ngModel: NgModel) {
		this.onNumeroPaginaAHChange.emit({
			participacao,
			event,
			ngModel,
		})
	}

	apostilaAHClick(participacao: Evento_Participacao_Aluno) {
		this.onApostilaAHClick.emit(participacao);
	}
	
	
	presente(participacao: Evento_Participacao_Aluno) {
		this.onPresente.emit(participacao);
	}

	presencaPrev(index: number, e: any) {
		let newIndex = index - 1;

		if (index <= 0) {
			newIndex = this.presencaButton.length - 1;
		}

		let element = this.presencaButton.get(newIndex);
		let button = $(`p-button[${element?.attrSelector}]`).find('button')

		button.trigger('focus');
	}

	presencaNext(index: number, e: any) {
		let newIndex = index + 1;

		if (index >= this.presencaButton.length - 1) {
			newIndex = 0;
		}

		let element = this.presencaButton.get(newIndex);
		let button = $(`p-button[${element?.attrSelector}]`).find('button')

		button.trigger('focus');
	}

	apostilaAbacoInputNumberPrev(index: number, inputNumber: InputNumber) {
		let newIndex = index - 1;

		if (index <= 0) {
			newIndex = this.presencaButton.length - 1;
		}

		var row = this.evento.alunos[newIndex];
		if (row.presente === false) {
			this.apostilaAbacoInputNumberPrev(newIndex, inputNumber)
			return
		}

		let element = this.apostilaAbacoInput.get(newIndex)
		element?.input.nativeElement.focus();
	}

	apostilaAHInputNumberPrev(index: number, inputNumber: InputNumber) {
		let newIndex = index - 1;

		if (index <= 0) {
			newIndex = this.presencaButton.length - 1;
		}

		var row = this.evento.alunos[newIndex];
		if (row.presente === false) {
			this.apostilaAHInputNumberPrev(newIndex, inputNumber)
			return
		}

		let element = this.apostilaAbacoInput.get(newIndex)
		element?.input.nativeElement.focus();
	}



	apostilaAbacoInputNumberNext(index: number, inputNumber: InputNumber) {
		let newIndex = index + 1;


		if (index >= this.presencaButton.length - 1) {
			newIndex = 0;
		}

		var row = this.evento.alunos[newIndex];
		if (row.presente === false) {
			this.apostilaAbacoInputNumberNext(newIndex, inputNumber)
			return
		}

		let element = this.apostilaAbacoInput.get(newIndex)
		element?.input.nativeElement.focus();
	}

	apostilaAHInputNumberNext(index: number, inputNumber: InputNumber) {
		let newIndex = index + 1;

		if (index >= this.presencaButton.length - 1) {
			newIndex = 0;
		}

		var row = this.evento.alunos[newIndex];
		if (row.presente === false) {
			this.apostilaAHInputNumberNext(newIndex, inputNumber)
			return
		}

		let element = this.apostilaAHInput.get(newIndex)
		element?.input.nativeElement.focus();
	}


}
