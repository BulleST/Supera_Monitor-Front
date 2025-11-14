import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { Aluno } from '../../../../../models/alunos.model';
import { AlunoService } from '../../../../../services/alunos.service';
import { EventoService } from '../../../../../services/evento.service';
import { showError } from '../../../../../utils';
import { ConfirmationService } from 'primeng/api';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import moment from 'moment';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { NgForm } from '@angular/forms';

@Component({
	selector: 'app-reposicao-de-select',
	standalone: false,
	templateUrl: './reposicao-de-select.component.html',
	styleUrl: './reposicao-de-select.component.css'
})
export class ReposicaoDeSelectComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;

	aluno = new Aluno;
	evento = new Evento;
	reposicaoDe!: Evento;
	data = new Date;

	eventos: Evento[] = [];
SalaAndar = SalaAndar;
	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private alunoService: AlunoService,
		private service: EventoService,
		private confirmationService: ConfirmationService,

	) {

		this.instance = this.dialogService.getInstance(this.ref);
		let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
		this.subscription.push(eventos);

	}
	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.evento = this.instance.data['evento'];
			this.aluno = this.instance.data['aluno'];

			this.loadEventos();
		}
	}

	ngOnDestroy(): void {
		this.subscription.forEach((item) => item.unsubscribe())
	}

	close(evento?: Evento) {
		this.ref.close(evento);
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}


	loadEventos() {
		if (!this.aluno || !this.evento || !this.data) {
			return
		}
		let request: CalendarioRequest = {
			aluno_Id: this.aluno.id,
			intervaloDe: moment(this.data).subtract(1, 'month').toDate(),
			intervaloAte: moment(this.data).add(1, 'month').toDate(),
		}
		this.loading = true;

		lastValueFrom(this.service.getList(request))
			.then(res => {
				this.eventos = res.eventos.filter(evento => {
					let ehAula = evento.evento_Tipo_Id == EventoTipo.Aula;
					let alunoEstaNaAula = evento.alunos.find(x => x.active === true)
					let alunoMarcouReposicao = alunoEstaNaAula?.reposicaoDe_Evento_Id || alunoEstaNaAula?.reposicaoPara_Evento_Id;
					let alunoGanhouPresenca = alunoEstaNaAula?.presente === true;

					let condicao = ehAula
						&& alunoEstaNaAula
						&& !alunoGanhouPresenca
						&& !alunoMarcouReposicao
					return condicao;
				});

				this.loading = false;
			})

	}


	selectEvento(e: any, form: NgForm) {
        if (form.invalid) {
            return this.showError('OPA!', `Não foi possível selecionar! <br> Preencha os dados corretamente para continuar`, e);
        }
		this.close(this.reposicaoDe);
	}
}
