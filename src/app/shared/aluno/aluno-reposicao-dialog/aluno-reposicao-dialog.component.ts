import { Component, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import { CalendarioRequest } from '../../../models/calendario.model';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Crypto, MensagemWhatsapp } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-aluno-reposicao-dialog',
  standalone: false,
  
  templateUrl: './aluno-reposicao-dialog.component.html',
  styleUrl: './aluno-reposicao-dialog.component.css'
})
export class AlunoReposicaoDialogComponent implements  OnDestroy {

    aluno_Id?: number;
    alunoSelected?: Aluno;
    blockAlunoField = false;
    
    eventoReposicao_Id?: number;
    eventoReposicaoSelected?: Evento;
    blockEventoField = false;

    visible = false;
    loading = false;
    subscription: Subscription[] = [];

    alunos: Aluno[] = [];
    loadingAlunos = false;

    eventosDisponiveis: Evento[] = [];
    loadingEventosDisponiveis = false;

    eventosReposicao: Evento[] = [];
    loadingEventosRepor = false;

    onHide = new EventEmitter<boolean>();

    constructor(
        private eventoService: EventoService,
        private alunoService: AlunoService,
        private toastr: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
    ) {
        
        var alunos = alunoService.list.subscribe(res => this.alunos = res);
        this.subscription.push(alunos)

        if (!this.alunos.length) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        var params = this.activatedRoute.params.subscribe(res => {
            if (res['aluno_id']) {
                this.aluno_Id = this.crypto.decrypt(res['aluno_id']);
                this.blockAlunoField = true;
                this.loadAluno();
                this.loadEventosReposicao();
            }
            if (res['eventoReposicao_Id']) {
                this.eventoReposicao_Id = this.crypto.decrypt(res['eventoReposicao_Id']);
                this.blockEventoField = true;
                this.eventoReposicaoSelected = this.eventoService.evento.value;
            }
        });
        this.subscription.push(params);
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    visibleChange() {

    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
        this.onHide.emit(true);
    }

    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    loadAluno() {
        if (this.aluno_Id) {
            this.alunoSelected = this.alunos.find(x => x.id == this.aluno_Id);
        }
    }

    loadEventosReposicao() {
        if (this.aluno_Id) {
            
            let request: CalendarioRequest = {
                aluno_Id: this.aluno_Id,
                intervaloDe: moment().subtract(1, 'month').toDate(),
                intervaloAte: moment().endOf('year').toDate(),
            }

            this.loadingEventosRepor = true;
            lastValueFrom(this.eventoService.calendario(request))
                .then(res => {
                    this.eventosReposicao = res.filter(aula => {
                        const alunoEstaNaAula = aula.alunos.find(x => x.aluno_Id == this.aluno_Id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.AulaExtra;
                        const naoMarcouReposicaoAinda = alunoEstaNaAula && !alunoEstaNaAula.reposicaoPara_Evento_Id;
                        const naoEhReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoDe_Evento_Id;
                        const naoGanhouPresenca = alunoEstaNaAula && !alunoEstaNaAula.presente;

                        return alunoEstaNaAula 
                            && ehAula 
                            && naoMarcouReposicaoAinda 
                            && naoEhReposicao 
                            && naoGanhouPresenca;
                    });
                    this.loadingEventosRepor = false;
                })
                .catch(res => {
                    this.loadingEventosRepor = true;
                    this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                });
        }
    }

    loadEventosDisponiveis() {
        if (this.aluno_Id && this.eventoReposicaoSelected) {
            let request: CalendarioRequest = {
                aluno_Id: this.aluno_Id,
                intervaloDe: moment(this.eventoReposicaoSelected.data).toDate(),
                intervaloAte: moment(this.eventoReposicaoSelected.data).add(1, 'month').toDate(),
            }

            this.loadingEventosDisponiveis = true;
            lastValueFrom(this.eventoService.calendario(request))
                .then(res => {
                    this.eventosDisponiveis = res.filter(aula => {
                        const alunoNaoEstaNaAula = !aula.alunos.find(x => x.aluno_Id == this.aluno_Id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.AulaExtra;
                        const temVagas = aula.alunos.filter(x => x.active).length < aula.capacidadeMaximaAlunos;
                        const perfilCognitivo = aula.perfilCognitivo.map(x => x.id).includes(this.alunoSelected!.perfilCognitivo_Id);
                        const aulaNaoFinalizada = !aula.finalizado;
                        const estaAtivo = aula.active;

                        return alunoNaoEstaNaAula
                            && ehAula
                            && temVagas
                            && perfilCognitivo
                            && aulaNaoFinalizada
                            && estaAtivo;
                    });
                    this.loadingEventosDisponiveis = false;
                })
                .catch(res => {
                    this.loadingEventosDisponiveis = true;
                    this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                });
        }
    }


    alunoChanged() {

    }

    sendConfirmation(form: NgForm, e: any) {

    }
}
