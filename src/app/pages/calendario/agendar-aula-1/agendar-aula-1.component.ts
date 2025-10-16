import { AfterViewInit, Component, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationService } from 'primeng/api'
import { lastValueFrom, Subscription } from 'rxjs'
import { NgModel } from '@angular/forms'
import { Aluno } from '../../../models/alunos.model'
import { AlunoService } from '../../../services/alunos.service'
import { MensagemWhatsapp, showError } from '../../../utils'

@Component({
	selector: 'app-agendar-aula-1',
	standalone: false,
	templateUrl: './agendar-aula-1.component.html',
	styleUrl: './agendar-aula-1.component.css',
	providers: [ConfirmationService],
})
export class AgendarAula1Component implements OnDestroy, AfterViewInit {
	visible: boolean = false
	subscription: Subscription[] = []

	alunos: Aluno[] = [];
	loadingAlunos = false;

	selectedAluno?: Aluno;
	selectedAlunoId:number = undefined as any;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private alunoService: AlunoService,
		private confirmationService: ConfirmationService,
		private mensagemWhatsapp: MensagemWhatsapp,
	) {
		let alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active))
		this.subscription.push(alunos)

		if (this.alunos.length == 0) {
			this.loadingAlunos = true
			lastValueFrom(this.alunoService.getList())
				.then(() => (this.loadingAlunos = false))
				.catch(() => (this.loadingAlunos = false))
		}


		this.visible = true
	}

	ngAfterViewInit(): void { }

	ngOnDestroy(): void {
		this.subscription.forEach((e) => e.unsubscribe())
	}

	visibleChange() {
		if (!this.visible) {
			this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
		}
	}

	alunoChanged(e: any, aluno_Id: NgModel) {
		this.loadingAlunos = true;
		lastValueFrom(this.alunoService.get(this.selectedAlunoId))
		.then(res => {
				this.selectedAluno = res;
				this.loadingAlunos = false;
			})
			.catch(res => {
				this.loadingAlunos = false;
			})
	}

	enviarMensagem(aluno: Aluno) {
		if (!aluno.celular) {
			this.showError('Erro', 'Nenhum celular cadastrado', aluno);
			return;
		}
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}

	showError(header: string, message: string, e: any) {
		showError(this.confirmationService, header, message, e);
	}


}
