import { Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Evento } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgForm, NgModel } from '@angular/forms';
import { CalendarioUtils, getError, MensagemWhatsapp, showError } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { PseudoEvento, ReposicaoAlunoRequest } from '../../../models/reposicao.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { SalaAndar } from '../../../models/sala-aula.model';
import { AlunoSelectComponent } from './aluno-select/aluno-select.component';
import { ReposicaoDeSelectComponent } from './reposicao-de-select/reposicao-de-select.component';
import { ReposicaoParaSelectComponent } from './reposicao-para-select/reposicao-para-select.component';

@Component({
    selector: 'app-aluno-reposicao-dialog',
    standalone: false,
    templateUrl: './aluno-reposicao-dialog.component.html',
    styleUrl: './aluno-reposicao-dialog.component.css',
    providers: [ConfirmationService]
})
export class AlunoReposicaoDialogComponent implements OnDestroy {
    
    visible = false;
    loading = false;
    subscription: Subscription[] = [];
    
    aluno?: Aluno;
    eventoReposicaoDe?: Evento;
    eventoReposicaoPara?: Evento;
    
    roteiros: Roteiro[] = [];
    loadingRoteiros = false;
    observacao: string = '';

    onHide = new EventEmitter<boolean>();
    SalaAndar = SalaAndar;

    @ViewChild('alunoSelectComponent') alunoSelectComponent!: AlunoSelectComponent;
    @ViewChild('reposicaoDeComponent') reposicaoDeComponent!: ReposicaoDeSelectComponent;
    @ViewChild('reposicaoParaComponent') reposicaoParaComponent!: ReposicaoParaSelectComponent;

    constructor(
        private eventoService: EventoService,
        private alunoService: AlunoService,
        private roteiroService: RoteiroService,
        private toastr: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private calendarioUtils: CalendarioUtils,
    ) {

        let roteiros = roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros)

        if (!this.roteiros.length) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList(moment().year()))
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }

        this.show();

        const aluno = this.alunoService.getAluno().subscribe(res => this.aluno = res);
        this.subscription.push(aluno)

        const eventoReposicaoDe = this.eventoService.getEventoReposicaoDe().subscribe(res => this.eventoReposicaoDe = res);
        this.subscription.push(eventoReposicaoDe)

        const eventoReposicaoPara = this.eventoService.getEventoReposicaoPara().subscribe(res => this.eventoReposicaoPara = res);
        this.subscription.push(eventoReposicaoPara)
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
        this.subscription = [];
    }


    visibleChange() {
        if (!this.visible) {

            this.alunoSelectComponent.onVisibleChange.emit(false);
            this.reposicaoDeComponent.onVisibleChange.emit(false);
            this.reposicaoParaComponent.onVisibleChange.emit(false);
            
            this.ngOnDestroy();
            
            let routeBack = '';
            
            let pathname = window.location.pathname;
            if (pathname.includes('calendario/reposicao/agendar')) {
                routeBack += '../../';
            } 
            else if (pathname.includes('dashboard/reposicao/agendar')) {
                routeBack += '../../';
            }
            
            let params = this.activatedRoute.snapshot.params;
            for (const [key, value] of Object.entries(params)) {
                routeBack += '../'
            }
           
                            
            this.router.navigate([routeBack], { relativeTo: this.activatedRoute })
            .then(res => {
                this.eventoService.setEvento(undefined)
                this.eventoService.setEventoReposicaoDe(undefined)
                this.eventoService.setEventoReposicaoPara(undefined)
                this.alunoService.setAluno(undefined);
            })

        }
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
        this.onHide.emit(true);
    }

    alunoChanged(aluno: Aluno) {
        if (!this.eventoService.eventoReposicaoDe.value) {
            this.eventoReposicaoDe = undefined;
        }
        if (!this.eventoService.eventoReposicaoPara.value) {
            this.eventoReposicaoPara = undefined;
        }
        this.aluno = aluno;
    }

    eventoReposicaoDeChanged(evento: Evento) {
        this.eventoReposicaoDe = evento;

        if (!this.eventoService.eventoReposicaoPara.value) {
            this.eventoReposicaoPara = undefined;
        }
    }

    eventoReposicaoParaChanged(evento: Evento) {
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

        if (!form.valid) {
            this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e);
            this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
            return;
        }

        let aluno = this.aluno as Aluno;
        let source = this.eventoReposicaoDe as Evento;
        let target = this.eventoReposicaoPara as Evento;
        let mensagem = `
            <p class="white-space-nowrap">Aluno(a): <b>${aluno.nome} </b></p>
            <p class="white-space-nowrap">Do dia: <b class="pl-5 -ml-1">${moment(source.data).format('DD/MM HH[h]mm')}</b> - ${source.turma}.</p>
            <p class="white-space-nowrap">Para o dia: <b>${moment(target.data).format('DD/MM HH[h]mm')}</b> - ${target.turma}.</p>
            <p>Continuar agendamento?</p>
        `;

        this.confirmationService.confirm({
            target: e.target,
            message: mensagem,
            header: 'Agendar reposição',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Agendar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e, aluno, source, target);
            },
            reject: () => {
            }
        });
    }


    async send(e: any, aluno: Aluno, source: Evento, target: Evento) {

        this.loading = true;

        let request = new ReposicaoAlunoRequest;
        request.aluno_Id = aluno.id;
        request.source_Aula_Id = source.id;
        request.dest_Aula_Id = target.id;
        request.observacao = this.observacao;

        let response: RequestResponse = { success: true, message: '', object: undefined };


        // Se a aula source não existir, cria a aula
        if (request.source_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(source)
            request.source_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        // Se a aula target não existir, cria a aula
        if (request.dest_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(target)
            request.dest_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        await lastValueFrom(this.alunoService.reposicao(request))
            .then(res => {
                // playSuccess();
                this.loading = false;
                if (res.success) {
                    this.eventoService.calendarioReload.emit(res.object.id);
                    this.toastr.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
                    if (aluno.celular) {
                        this.sendMensagemAluno(e, aluno, source, target);
                    } else {
                        this.visible = false;
                        this.visibleChange();
                    }
                }
            })
            .catch(res => {
                this.loading = false;
                this.showError('Erro', `Não foi possível agendar reposição. <br> ${getError(res)}`, e)
            })
    }

    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }

    sendMensagemAluno(e: any, aluno: Aluno, source: Evento, target: Evento) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Reposição agendada com sucesso. <br> Clique para enviar mensagem de confirmação. <br> Celular: ${aluno.celular}`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            rejectLabel: 'Não enviar',
            acceptIcon: 'pi pi-whatsapp',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded p-button-success',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange();
                let url = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.nome, aluno.celular, source, target);
                window.open(url.link, '_blank');
                this.mensagemWhatsapp.copiarMensagem(url.mensagem);
            },
            reject: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }
}
