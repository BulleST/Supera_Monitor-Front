import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento, EventoCancelamentoRequest, EventoTipo } from '../../../../models/evento.model';
import { Aluno } from '../../../../models/alunos.model';
import { SalaAndar } from '../../../../models/sala-aula.model';
import { EventoService } from '../../../../services/evento.service';
import { AlunoService } from '../../../../services/alunos.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarioUtils, getError, MensagemWhatsapp, showError } from '../../../../utils';
import moment from 'moment';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { RequestResponse } from '../../../../helpers/request-response.interface';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EventoAgendarFaltaRequest } from '../../../../models/evento-agendar-falta-request.model';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { showEnviarMensagemAlunos } from '../../../../utils/show-enviar-mensagem-alunos';
import { MensagemTipo } from '../../enviar-mensagem-alunos/enviar-mensagem-alunos.component';
import { JornadaSuperaService } from '../../../../services/jornada-supera.service';
import { MonitoramentoService } from '../../../../services/monitoramento.service';
import { showContato } from '../../../../utils/show-contato';

@Component({
    selector: 'app-agendar-falta',
    standalone: false,
    templateUrl: './agendar-falta.component.html',
    styleUrl: './agendar-falta.component.css',
    providers: [ConfirmationService]
})
export class AgendarFaltaComponent implements OnInit, OnDestroy {
    subscription: Subscription[] = [];
    instance: DynamicDialogComponent | undefined;
    loading = false;
    maximized = false;
    view = new AgendarFaltaView;

    evento?: Evento;
    aluno?: Aluno;
    participacao?: Evento_Participacao_Aluno;

    SalaAndar = SalaAndar;
    EventoTipo = EventoTipo;

    request = new EventoAgendarFaltaRequest;

    refChild: DynamicDialogRef | undefined;

    constructor(
        private dialogService: DialogService,
        private ref: DynamicDialogRef,
        private eventoService: EventoService,
        private jornadaService: JornadaSuperaService,
        private monitoramentoService: MonitoramentoService,
        private alunoService: AlunoService,
        private toastrService: ToastrService,
        private confirmationService: ConfirmationService,
        private calendarioUtils: CalendarioUtils,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
        this.instance = this.dialogService.getInstance(this.ref);

        let evento = this.eventoService.getEvento().subscribe(res => this.evento = res);
        this.subscription.push(evento)

        let aluno = this.alunoService.getAluno().subscribe(res => this.aluno = res);
        this.subscription.push(aluno)
    }

    ngOnInit(): void {
        // this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.view = this.instance.data['view'];
            this.evento = this.view.evento;
            this.aluno = this.view.aluno;

        }
        this.setParticipacao();
    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
		this.eventoService.setEvento(undefined)
		this.alunoService.setAluno(undefined);
    }

    close(success: boolean) {
        this.eventoService.setEvento(undefined)
        this.alunoService.setAluno(undefined);
        this.ref.close(success);
    }

    maximize() {
        this.maximized = !this.maximized;
        this.instance!.maximize();
    }

    setParticipacao() {
        if (this.evento && this.aluno) {
            this.participacao = this.evento.alunos.find(x => x.aluno_Id == this.aluno!.id);
        }
    }

    alunoChanged(aluno: Aluno) {
        if (!this.eventoService.getEvento().value) {
            this.evento = undefined;
        }
        this.aluno = aluno;
        this.setParticipacao();
    }

    eventoChanged(evento?: Evento) {
        this.evento = evento;
        this.eventoService.setEvento(evento);
        this.setParticipacao();
    }

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
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

    formatDate(evento: Evento) {
        return this.calendarioUtils.formatDate(evento.data)
    }

    sendConfirmation(e: any) {
        if (!this.aluno) {
            this.toastrService.error('Selecione um aluno');
        }
        else if (!this.evento) {
            this.toastrService.error('Selecione uma aula');
        }
        else {
            const data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
            const tipo = this.evento.evento_Tipo.toLowerCase();
            const evento = this.evento as Evento;
            const participacao = this.participacao as Evento_Participacao_Aluno;

            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja agendar falta da ${tipo} para o aluno <b>${this.aluno.nome} </b> no dia <b>${data}</b>?`,
                header: 'Agendar falta',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Continuar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    const response1 = await this.salvarEvento(e);
                    if (response1.success) {
                        const response2 = await this.agendarFalta(e)
                        if (response2.success) {
                            if (evento.alunos.length == 1 && [EventoTipo.AulaZero, EventoTipo.Superacao].includes(evento.evento_Tipo_Id)) {
                                const response3 = await this.cancelarEvento(e);
                                if (response3.success) {
                                    this.finally()
                                }
                            }
                            else {
                                this.finally()
                            }
                        }
                    }
                },
                reject: () => { },
            })

        }
    }


    salvarEvento(e: any) {
        let evento = this.evento as Evento;
        let aluno = this.aluno as Aluno;

        if (evento.id == PseudoEvento.EventoId) {
            return this.calendarioUtils.requestAulaTurma(evento)
                .then(res => {
                    this.loading = false;
                    if (res.success) {
                            evento = res.object;
                            this.evento = evento;
                            this.participacao = evento.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;
                    }
                    else {
                        this.showError(
                            'Falta não agendada',
                            `Ocorreu um erro ao agendar falta. <br> ${res.message}`,
                            e,
                        )
                    }
                    return res;
                })
                .catch(res => {
                    this.loading = false;
                    this.showError(
                        'Falta não agendada',
                        `Ocorreu um erro ao agendar falta. <br> ${getError(res)}`,
                        e
                    )
                    const response: RequestResponse = {
                        success: false,
                        message: `Ocorreu um erro ao agendar falta. <br> ${getError(res)}`,
                        object: null
                    };
                    return response;
                })
        }
        else {
            const response: RequestResponse = {
                success: true,
                message: `OK`,
                object: evento
            };
            return response;

        }
    }

    agendarFalta(e: any) {
        this.loading = true

        let aluno = this.aluno as Aluno;
        let evento = this.evento as Evento;

        this.participacao = evento.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

        let request: EventoAgendarFaltaRequest = {
            participacao_Id: this.participacao.id,
            statusContato_Id: this.request.statusContato_Id,
            observacao: this.request.observacao,
            contatoObservacao: this.request.contatoObservacao,
            alunoContactado: this.request.alunoContactado,
            reposicaoDe_Evento_Id: this.participacao.reposicaoDe_Evento_Id,
        };

        return lastValueFrom(this.eventoService.cancelarParticipacao(request))
        .then(res => {
            this.loading = false;
            if (res.success) {
                evento = res.object;
                this.evento = evento;
                this.participacao = evento.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

            } else {
                this.showError('OPS', 'Não foi possível agendar falta.', e, res.message)
            }
            return res;
        })
        .catch(res => {
            this.showError('OPS', 'Não foi possível agendar falta.', e, res.message)
            
            const response: RequestResponse = {
                success: false,
                message: `Ocorreu um erro ao agendar falta. <br> ${getError(res)}`,
                object: null
            };
            return response;
        })
    }

    cancelarEvento(e: any) {
        this.loading = true

        let aluno = this.aluno as Aluno;
        let evento = this.evento as Evento;

        
        let request: EventoCancelamentoRequest = {
            id: evento.id,
            observacao: this.request.observacao,
        };

        return lastValueFrom(this.eventoService.cancelar(request))
        .then(res => {
            this.loading = false;
            if (res.success) {
                evento = res.object;
                this.evento = evento;
                this.participacao = evento.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;
            } else {
                this.showError('OPS', 'Não foi possível agendar falta.', e, res.message)
            }
            return res;
        })
        .catch(res => {
            this.showError('OPS', 'Não foi possível agendar falta.', e, res.message)
            
            const response: RequestResponse = {
                success: false,
                message: `Ocorreu um erro ao agendar falta. <br> ${getError(res)}`,
                object: null
            };
            return response;
        })
    }

    finally() {
        let evento = this.evento as Evento;
        
        this.jornadaService.onReload.emit();
        this.monitoramentoService.onReload.emit();
        this.eventoService.onReload.emit();
        this.toastrService.success('Falta agendada com sucesso!');
        this.sendMensagemAluno();
    }

    sendMensagemAluno() {
        const evento = this.evento as Evento;
        const aluno = this.aluno as Aluno;
        const participacao = this.participacao as Evento_Participacao_Aluno;

        if (this.aluno) {
            const ref = showEnviarMensagemAlunos(
                this.dialogService,
                [aluno],
                evento,
                MensagemTipo.FaltaAgendada,
                undefined,
                undefined,
                participacao,
            )
            let onClose = ref.onClose.subscribe(res => this.close(true))
            this.subscription.push(onClose)
        }
        else {
            this.close(true);
        }
    }


}

export class AgendarFaltaView {
    aluno?: Aluno;
    evento?: Evento;
}