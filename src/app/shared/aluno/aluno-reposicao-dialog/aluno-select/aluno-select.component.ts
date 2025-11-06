import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { AlunoService } from '../../../../services/alunos.service';
import { SelectChangeEvent } from 'primeng/select';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '../../../../models/evento.model';
import { SalaAndar } from '../../../../models/sala-aula.model';

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
	@Output() onVisibleChange = new EventEmitter<boolean>();

	constructor(
		private service: AlunoService,
		private crypto: Crypto,
		private activatedRoute: ActivatedRoute,
		private toastr: ToastrService,
		private mensagemWhatsapp: MensagemWhatsapp,

	) {

		this.onVisibleChange.subscribe(res => {
			if (!res) {
				this.ngOnDestroy();
			}
		})

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
			this.alunos = this.alunos.filter(x => x.active == true && !!x.turma_Id);


			let params = this.activatedRoute.snapshot.paramMap;

			if (params.get('evento_reposicao_de') && this.eventoReposicaoDe) {

				// Se um evento estiver selecionado, 
				// os unicos alunos a estarem disponiveis são os alunos daquela aula que
				// estão ativos e que não tem reposição agendada
					
				let alunosAula = this.eventoReposicaoDe.alunos
									.filter(x => x.active && !x.reposicaoDe_Evento_Id && !x.reposicaoPara_Evento_Id)
									.map(x => x.aluno_Id)

				this.alunos = this.alunos.filter(x => alunosAula.includes(x.id))

			}

			console.log('oi')
			if (params.get('evento_reposicao_para') && this.eventoReposicaoPara) {
				console.log('eventoReposicaoPara', this.eventoReposicaoPara)

				// Se um evento estiver selecionado, 
				// os unicos alunos a estarem disponiveis são os alunos que 
				// não estão naquela aula
				// e que tem perfil compativel
				// e que não tenha restrição de mobilidade caso a aula não seja no térreo
					
				let alunosAula = this.eventoReposicaoPara.alunos
									.filter(x => x.active)
									.map(x => x.aluno_Id)

				let perfilAula = this.eventoReposicaoPara.perfilCognitivo.map(x => x.id)

				this.alunos = this.alunos.filter(aluno => {

					let alunoEstaNaAula = alunosAula.includes(aluno.id) 
					let perfilCompativel = perfilAula.includes(aluno.perfilCognitivo_Id) || !aluno.perfilCognitivo_Id
					let salaValida = !aluno.restricaoMobilidade || this.eventoReposicaoPara?.andar == SalaAndar.Terreo;

					return !alunoEstaNaAula && perfilCompativel && salaValida;
				});

				
			}
		}
	}

	loadAluno(aluno_Id: number) {
		console.log('loadAluno', aluno_Id)
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
		console.log('alunoChanged', e)
		console.log('aluno', this.aluno)
		if (this.aluno) {
			this.onAlunoChanged.emit(this.aluno);
			this.loadAluno(this.aluno?.id).then(res => this.service.setAluno(res))
		}
	}


}
