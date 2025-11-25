import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../models/evento.model';
import { Evento_Participacao_Aluno, statusContato } from '../../../../models/evento-participacao-aluno.model';
import { SelectChangeEvent } from 'primeng/select';
import { NgModel } from '@angular/forms';

@Component({
	selector: 'app-card',
	standalone: false,
	templateUrl: './card.component.html',
	styleUrl: './card.component.css'
})
export class CardComponent implements OnChanges {

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


    activeIndexAluno = 0;
	statusContato = statusContato;


	constructor() {

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


}
