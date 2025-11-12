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
    selector: 'app-reposicao-aluno-select',
    standalone: false,
    templateUrl: './reposicao-aluno-select.component.html',
    styleUrl: '../agendar-reposicao-dialog.component.css',
})
export class ReposicaoAlunoSelectComponent implements OnChanges, OnDestroy {

    aluno_Id?: number;
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

        let aluno = this.service.getAluno().subscribe(alunoRes => {

            let params = this.activatedRoute.snapshot.paramMap;
            let alunoIdParam = params.get('aluno_id');
            this.readonly = !!alunoIdParam;


            if (!alunoRes && alunoIdParam) {
                this.aluno_Id = this.crypto.decrypt(alunoIdParam);;
                this.loadAluno();
                return;
            }

            this.aluno = alunoRes;
            this.aluno_Id = alunoRes?.id;

            if (!this.readonly) {
                if (!this.service.list.value.length) {
                    this.loadingAlunos = true;
                    lastValueFrom(this.service.getList())
                        .then(res => this.loadingAlunos = false)
                        .catch(res => this.loadingAlunos = false);
                }

                let alunos = this.service.list.subscribe(list => {
                    this.alunos = list;

                    this.setAlunos();

                    if (alunoRes) {
                        let index = this.alunos.findIndex(x => x.id == alunoRes.id);
                        if (index != -1) this.alunos.splice(index, 1, alunoRes);
                        this.aluno = this.alunos[index];
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

            if (params.get('evento_reposicao_para') && this.eventoReposicaoPara) {

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

    loadAluno() {
        console.log('loadAluno')
        console.log('aluno_Id', this.aluno_Id)
        if (!this.aluno_Id) return;

        this.loading = true;

        let aluno = this.alunos.find(x => x.id == this.aluno_Id);
        this.onAlunoChanged.emit(aluno);

        return lastValueFrom(this.service.get(this.aluno_Id))
            .then(res => {
                this.aluno = res;
                let index = this.alunos.findIndex(x => x.id == res.id);
                if (index != -1) this.alunos.splice(index, 1, res);
                this.loading = false;
                this.service.setAluno(this.aluno)
                this.onAlunoChanged.emit(aluno);

                return res;
            })
            .catch(res => {
                this.loading = false;
                this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
                return undefined;
            })
    }


    alunoChanged(e: SelectChangeEvent) {
        console.log('alunoChanged', e)
        if (e.value) {
            this.aluno_Id = e.value.id;
            this.loadAluno()
        }
    }


}
