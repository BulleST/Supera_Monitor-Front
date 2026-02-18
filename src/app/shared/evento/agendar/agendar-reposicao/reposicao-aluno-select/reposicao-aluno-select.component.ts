import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { AlunoService } from '../../../../../services/alunos.service';
import { SelectChangeEvent } from 'primeng/select';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '../../../../../models/evento.model';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { EventoService } from '../../../../../services/evento.service';

@Component({
    selector: 'app-reposicao-aluno-select',
    standalone: false,
    templateUrl: './reposicao-aluno-select.component.html',
    styleUrl: '../agendar-reposicao.component.css',
})
export class ReposicaoAlunoSelectComponent implements OnDestroy {

    aluno_Id?: number;
    aluno?: Aluno;
    alunos: Aluno[] = [];
    loadingAlunos = false;
    loading = false;
    readonly = false;
    subscription: Subscription[] = [];

    eventoReposicaoDe?: Evento;
    eventoReposicaoPara?: Evento;
    @Output() onAlunoChanged = new EventEmitter<Aluno>();
    @Output() onVisibleChange = new EventEmitter<boolean>();

    constructor(
        private alunoService: AlunoService,
        private crypto: Crypto,
        private activatedRoute: ActivatedRoute,
        private toastr: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private eventoService: EventoService,

    ) {

        let onVisibleChange = this.onVisibleChange.subscribe(res => {
            if (!res) {
                this.ngOnDestroy();
            }
        })
        this.subscription.push(onVisibleChange);
        
		const eventoReposicaoDe = this.eventoService.getEventoReposicaoDe().subscribe(res => this.eventoReposicaoDe = res);
		this.subscription.push(eventoReposicaoDe);

		const eventoReposicaoPara = this.eventoService.getEventoReposicaoPara().subscribe(res => this.eventoReposicaoPara = res);
		this.subscription.push(eventoReposicaoPara);

        let aluno = this.alunoService.getAluno().subscribe(alunoRes => {

            let params = this.activatedRoute.snapshot.queryParamMap;

            let idParam = params.get('aluno_id');

            this.readonly = idParam != null && idParam != 'null';
            
            if (idParam) {
                this.aluno_Id = this.crypto.decrypt(idParam);
            }

            this.aluno_Id = alunoRes?.id;
            this.aluno = alunoRes;

            if (!alunoRes && this.aluno_Id) {
                this.loadAluno();
                return;
            }

            let alunos = this.alunoService.list.subscribe(list => {
                this.alunos = list;
				this.setAluno();
            });
            this.subscription.push(alunos)

        });
        this.subscription.push(aluno);

        let paramMap = this.activatedRoute.paramMap.subscribe(params => {
            
            console.log('paramMap', params)
            let request = null;

            if (params.get('evento_reposicao_de') && this.eventoReposicaoDe) {
                request = this.alunoService.getListReposicaoDeDropdown(this.eventoReposicaoDe.id);
            }

            if (params.get('evento_reposicao_para') && this.eventoReposicaoPara) {
                request = this.alunoService.getListReposicaoParaDropdown(this.eventoReposicaoPara.id);
            }

            if(!params.get('evento_reposicao_de') && !params.get('evento_reposicao_para')) {
                request = this.alunoService.getList();
            }

            if (request) {
                this.loadingAlunos = true;
                lastValueFrom(request)
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false)
            }

        });
        this.subscription.push(paramMap);
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

	setAluno() {
		let index = this.alunos.findIndex(x => x.id == this.aluno_Id);
		this.aluno = this.alunos[index];
        return this.aluno;
	}

    setAlunos(where: string) {
        console.log('setAlunos', where)
            let params = this.activatedRoute.snapshot.queryParamMap;
            console.log('params', params)

            var request = null;

            if (params.get('evento_reposicao_de') && this.eventoReposicaoDe) {
                request = this.alunoService.getListReposicaoDeDropdown(this.eventoReposicaoDe.id);
            }

            if (params.get('evento_reposicao_para') && this.eventoReposicaoPara) {
                request = this.alunoService.getListReposicaoParaDropdown(this.eventoReposicaoPara.id);
            }

            if(!params.get('evento_reposicao_de') && !params.get('evento_reposicao_para')) {
                request = this.alunoService.getList();
            }

            if (request) {
                this.loadingAlunos = true;
                lastValueFrom(request)
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false)
            }
        // }
    }

    loadAluno() {
        if (!this.aluno_Id) return;

        this.loading = true;
        
        this.setAluno();


        return lastValueFrom(this.alunoService.get(this.aluno_Id))
            .then(res => {
                this.aluno = res;
                this.loading = false;
                this.alunoService.setAluno(this.aluno)
                this.onAlunoChanged.emit(this.aluno);

                return res;
            })
            .catch(res => {
                this.loading = false;
                this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
                this.onAlunoChanged.emit(this.aluno);
				return this.aluno;
            })
    }


    alunoChanged(e: SelectChangeEvent) {
        if (e.value) {
            this.aluno_Id = e.value;
            this.loadAluno()
        }
    }


}
