import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { Evento } from '../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { Roteiro } from '../../../../models/roteiro.model';
import { ReposicaoAlunoSelectComponent } from './reposicao-aluno-select/reposicao-aluno-select.component';
import { ReposicaoDeSelectComponent } from './reposicao-de-select/reposicao-de-select.component';
import { ReposicaoParaSelectComponent } from './reposicao-para-select/reposicao-para-select.component';
import { EventoService } from '../../../../services/evento.service';
import { AlunoService } from '../../../../services/alunos.service';
import { RoteiroService } from '../../../../services/roteiro.service';
import moment from 'moment';
import { showAgendarReposicaoConfirm } from '../../../../utils/show-reposicao-confirm';
import { NgForm } from '@angular/forms';
import { showError } from '../../../../utils';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-agendar-reposicao',
	standalone: false,
	templateUrl: './agendar-reposicao.component.html',
	styleUrl: './agendar-reposicao.component.css',
	providers: [ConfirmationService]
})
export class AgendarReposicaoComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;
	view = new AgendarReposicaoView;

	aluno?: Aluno;
	eventoReposicaoDe?: Evento;
	eventoReposicaoPara?: Evento;
	
	roteiros: Roteiro[] = [];
	loadingRoteiros = false;

	@ViewChild('reposicaoAlunoComponent') reposicaoAlunoComponent!: ReposicaoAlunoSelectComponent;
	@ViewChild('reposicaoDeComponent') reposicaoDeComponent!: ReposicaoDeSelectComponent;
	@ViewChild('reposicaoParaComponent') reposicaoParaComponent!: ReposicaoParaSelectComponent;


	blockReposicaoDe = false;
	blockReposicaoPara = false;

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private eventoService: EventoService,
		private alunoService: AlunoService,
		private roteiroService: RoteiroService,
		private confirmationService: ConfirmationService,
		private activatedRoute: ActivatedRoute,
	){
		this.instance = this.dialogService.getInstance(this.ref);

		let params = this.activatedRoute.snapshot.paramMap;
		this.blockReposicaoDe = !!params.get('evento_reposicao_de');
		this.blockReposicaoPara = !!params.get('evento_reposicao_para');
		
		let roteiros = roteiroService.list.subscribe(res => this.roteiros = res);
		this.subscription.push(roteiros)

		if (!this.roteiros.length) {
			this.loadingRoteiros = true;
			lastValueFrom(this.roteiroService.getList(moment().year()))
				.then(res => this.loadingRoteiros = false)
				.catch(res => this.loadingRoteiros = false);
		}

		const aluno = this.alunoService.getAluno().subscribe(res => this.aluno = res);
		this.subscription.push(aluno)

		const eventoReposicaoDe = this.eventoService.getEventoReposicaoDe().subscribe(res => this.eventoReposicaoDe = res);
		this.subscription.push(eventoReposicaoDe)

		const eventoReposicaoPara = this.eventoService.getEventoReposicaoPara().subscribe(res => this.eventoReposicaoPara = res);
		this.subscription.push(eventoReposicaoPara)

	}
	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
		}
	}

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
		this.subscription = [];
    }

    close() {
		this.reposicaoAlunoComponent.onVisibleChange.emit(false);
		this.reposicaoDeComponent.onVisibleChange.emit(false);
		this.reposicaoParaComponent.onVisibleChange.emit(false);
		
		this.ngOnDestroy();

		this.eventoService.setEvento(undefined)
		this.eventoService.setEventoReposicaoDe(undefined)
		this.eventoService.setEventoReposicaoPara(undefined)
		this.alunoService.setAluno(undefined);
        
		this.ref.close();
    }

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}

	alunoChanged(aluno: Aluno) {
		console.log('alunoChanged', aluno)
		if (!this.blockReposicaoDe) {
			this.eventoReposicaoDe = undefined;
			this.eventoService.setEventoReposicaoDe(undefined);
		}
		if (!this.blockReposicaoPara) {
			this.eventoReposicaoPara = undefined;
			this.eventoService.setEventoReposicaoPara(undefined);
		}
		this.aluno = aluno;
	}

	eventoReposicaoDeChanged(evento: Evento) {
		console.log('eventoReposicaoDeChanged', evento)
		this.eventoReposicaoDe = evento;

		if (!this.blockReposicaoPara) {
			this.eventoReposicaoPara = undefined;
			this.eventoService.setEventoReposicaoPara(undefined);
		}
	}

	eventoReposicaoParaChanged(evento: Evento) {
		console.log('eventoReposicaoParaChanged', evento)
		this.eventoReposicaoPara = evento;
	}

	showError(header: string, message: string, e: any) {
		showError(this.confirmationService, header, message, e);
	}

	saveDisabled(form: NgForm) {
		return this.loading
			|| form.invalid
			|| !this.aluno
			|| !this.eventoReposicaoDe
			|| !this.eventoReposicaoPara;
	}

	sendConfirmation(form: NgForm, e: any) {
		let aluno = this.aluno as Aluno;
		let source = this.eventoReposicaoDe as Evento;
		let target = this.eventoReposicaoPara as Evento;
		let participacao = source.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

		var ref = showAgendarReposicaoConfirm(participacao, source, target, this.dialogService);
		var onClose = ref.onClose.subscribe(agendamentoCancelado => {
			if (!agendamentoCancelado) {
				this.eventoService.calendarioReload.emit(1);
			}
			this.close();
		})
		this.subscription.push(onClose);

	}



}

export class AgendarReposicaoView {
	aluno?: Aluno;
	eventoReposicaoDe?: Evento;
	eventoReposicaoPara?: Evento;
}
