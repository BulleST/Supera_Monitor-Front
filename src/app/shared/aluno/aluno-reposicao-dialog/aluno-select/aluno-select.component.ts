import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { AlunoService } from '../../../../services/alunos.service';
import { SelectChangeEvent } from 'primeng/select';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '../../../../models/evento.model';

@Component({
	selector: 'app-aluno-select',
	standalone: false,
	templateUrl: './aluno-select.component.html',
    styleUrl: '../aluno-reposicao-dialog.component.css',
})
export class AlunoSelectComponent implements OnChanges, OnDestroy {

	aluno?: Aluno;
	alunos: Aluno[] = [];
	loadingAlunos = false;
	loading = false;
	readonly = false;
	subscription: Subscription[] = [];

	@Input() eventoReposicaoDe?: Evento;
	@Input() eventoReposicaoPara?: Evento;
	@Output() onAlunoChanged = new EventEmitter<Aluno>();

	constructor(
		private service: AlunoService,
		private crypto: Crypto,
		private activatedRoute: ActivatedRoute,
		private toastr: ToastrService,
		private mensagemWhatsapp: MensagemWhatsapp,

	) {

		let aluno = this.service.getAluno().subscribe(async res => {
			let params = this.activatedRoute.snapshot.paramMap;
			let aluno_id = params.get('aluno_id');
			this.readonly = !!aluno_id;

			if (!res) {
				if (aluno_id) {
					const id = this.crypto.decrypt(aluno_id);
					res = await this.loadAluno(id);
					this.service.setAluno(res)
				} 
			}
			
			this.aluno = res;
			this.onAlunoChanged.emit(res);

			if (!this.readonly) {
				if (!this.service.list.value.length) {
					this.loadingAlunos = true;
					lastValueFrom(this.service.getList())
						.then(res => this.loadingAlunos = false)
						.catch(res => this.loadingAlunos = false);
				}

				let alunos = this.service.list.subscribe(res => {
					this.alunos = res;
					
					this.setAlunos();
					
					if (this.aluno) {
						let index = this.alunos.findIndex(x => x.id == this.aluno?.id);
						if (index != -1) this.alunos.splice(index, 1, this.aluno);
					}
				});
				this.subscription.push(alunos)

			}
		});
		this.subscription.push(aluno);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['eventoReposicaoDe']) this.eventoReposicaoDe = changes['eventoReposicaoDe'].currentValue;
		if (changes['eventoReposicaoPara']) this.eventoReposicaoPara = changes['eventoReposicaoPara'].currentValue;
		this.setAlunos();
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	enviarMensagem(aluno: Aluno) {
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}
	
    getRestricoes(aluno: Aluno) {
        let restricoes = aluno.restricoes.filter(x => x.active).map(x => x.descricao)
        return restricoes.length ? restricoes.join(', ') : 'Nenhuma restrição';
    }

	setAlunos() {
		if (this.alunos.length) {
			this.alunos = this.alunos.filter(x => x.active == true && !!x.turma_Id)
			// if (this.eventoReposicaoPara) {

			// 	// Em caso de rota por selected-evento.component > opções > agendar reposicao
			// 	// Vai marcar o para
			// 	// Filtra somente os alunos que não estão nessa aula

			// 	let alunosId = this.eventoReposicaoPara.alunos.filter(x => x.active).map(X => X.aluno_Id);
			// 	this.alunos = this.alunos.filter(x => !alunosId.includes(x.id) && x.active == true)

			// 	// OBS: 
			// 	// Se em caso de rota por selected-evento.component > aluno-popover.component > opções > agendar reposicao
			// 	// OU _initial/monitoramento-dashboard.component > agendar reposicao
			// 	// o eventoReposicaoDe é marcado e a rota é inserida com o aluno_id, impossibilitando seleção de outro aluno
			// 	// Sendo assim não precisa filtrar os alunos nesse caso
			// }

		}
	}


	loadAluno(aluno_Id: number) {
		this.loading = true;
		return lastValueFrom(this.service.get(aluno_Id))
			.then(res => {
				this.aluno = res;
				let index = this.alunos.findIndex(x => x.id == res.id);
				if (index != -1) this.alunos.splice(index, 1, res);
				this.loading = false;
				return this.aluno;
			})
			.catch(res => {
				this.loading = false;
				this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
				return undefined;
			})
	}


	alunoChanged(e: SelectChangeEvent) {
		if (this.aluno) {
			this.onAlunoChanged.emit(this.aluno);
			this.loadAluno(this.aluno?.id).then(res => this.service.setAluno(res))
		}
	}


}
