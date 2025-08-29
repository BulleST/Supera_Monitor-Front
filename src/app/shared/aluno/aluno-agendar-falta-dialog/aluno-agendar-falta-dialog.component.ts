import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgForm, NgModel } from '@angular/forms';
import { CalendarioUtils, Crypto, getError, MensagemWhatsapp, showError } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { SalaAulaPipe } from '../../../utils/sala-aula.pipe';
import { ConfirmationService } from 'primeng/api';
import { PseudoEvento } from '../../../models/reposicao.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { SelectChangeEvent } from 'primeng/select';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { CalendarioRequest } from '../../../models/calendario.model';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { EventoAgendarFaltaRequest } from '../../../models/evento-agendar-falta-request.model';

@Component({
    selector: 'app-aluno-agendar-falta-dialog',
    standalone: false,
    templateUrl: './aluno-agendar-falta-dialog.component.html',
    styleUrl: './aluno-agendar-falta-dialog.component.css',
    providers: [ConfirmationService]
})
export class AlunoAgendarFaltaDialogComponent implements OnDestroy {
    aluno?: Aluno;
    blockAlunoField = false;
    request = new EventoAgendarFaltaRequest;

    evento?: Evento;
    blockEventoField = false;

    visible = false;
    loading = false;
    subscription: Subscription[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

    sugestaoReposicao: Evento[] = [];
    eventos: Evento[] = [];
    loadingEventos = false;

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    onHide = new EventEmitter<boolean>();

    alunoContactado = false;

    status = [
        { value: 1, label: 'Não compareceu' },
        { value: 2, label: 'Aguardando Retorno' },
        { value: 3, label: 'Optou por não repor' },
        { value: 4, label: 'Aula Cancelada' },
        { value: 5, label: 'Reposição Agendada' },
        { value: 6, label: 'Reposição Realizada' },
        { value: 7, label: 'Não Compareceu na reposição' },
        { value: 8, label: 'Reposição Desmarcada' },
        { value: 9, label: 'Outro' },
    ]

    constructor(
        private eventoService: EventoService,
        private alunoService: AlunoService,
        private toastr: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private salaAulaPipe: SalaAulaPipe,
        private confirmationService: ConfirmationService,
        private roteiroService: RoteiroService,
        private calendarioUtils: CalendarioUtils,
    ) {

        let roteiros = roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros)

        if (!this.roteiros.length) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList())
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }


        let aluno = this.alunoService.getAluno().subscribe(async res => {
            if (!res) {
                let params = this.activatedRoute.snapshot.paramMap;
                 if (params.get('aluno_id')) {
                    const aluno_Id = this.crypto.decrypt(params.get('aluno_id'));
                    this.blockAlunoField = true;
                    let aluno = await this.loadAluno(aluno_Id);
                    this.alunoService.setAluno(aluno)
                }
            }
            if (res) {
                this.aluno = res;
                this.blockAlunoField = true;
            }
            else {
                
                let alunos = alunoService.list.subscribe(res => {
                    this.alunos = res;
                    this.setAlunos();
                });
                this.subscription.push(alunos)

                if (!this.alunos.length) {
                    this.loadingAlunos = true;
                    lastValueFrom(this.alunoService.getList())
                        .then(res => this.loadingAlunos = false)
                        .catch(res => this.loadingAlunos = false);
                }
            }
            this.show();
        });
        this.subscription.push(aluno);

        let evento = this.eventoService.getEvento().subscribe(res => {
            if (res) {
                this.evento = res;
                this.blockEventoField = true;
                this.loadSugestoesReposicao();
            }
        });
        this.subscription.push(evento);

    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    visibleChange() {
        if (!this.visible) {
            let params = this.activatedRoute.snapshot.params;
            let routeBack = params['aluno_id'] ? ['../../'] : ['..'];
            this.eventoService.setEvento(undefined)
            this.alunoService.setAluno(undefined)
            this.router.navigate(routeBack, { relativeTo: this.activatedRoute });
        }
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
        this.onHide.emit(true);
    }

    enviarMensagem(aluno: Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    setAlunos() {
        if (this.alunos.length) {
            this.alunos = this.alunos.filter(x => x.active == true && !!x.turma_Id)

            if (this.evento) {
                let alunos = this.evento.alunos.filter(x => x.active).map(X => X.aluno_Id);
                this.alunos = this.alunos.filter(x => !alunos.includes(x.id) && x.active == true)
            }

        }
    }

    loadAluno(aluno_Id: number) {
        this.loadingAlunos = true;
        return lastValueFrom(this.alunoService.get(aluno_Id))
            .then(res => {
                this.aluno = res;
                this.loadingAlunos = false;
                return this.aluno;
            })
            .catch(res => {
                this.loadingAlunos = false;
                this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
                return undefined;
            })
    }

    alunoChanged(e: SelectChangeEvent) {
    }

    loadSugestoesReposicao() {
        
        if (!this.aluno || !this.evento) {
            return
        }
        
        let evento = this.evento;
        let aluno = this.aluno;

        let request: CalendarioRequest = {
            intervaloDe: moment(evento.data).toDate(),
            intervaloAte: moment(evento.data).add(1, 'month').toDate(),
            perfil_Cognitivo_Id: aluno.perfilCognitivo_Id,
        }

        lastValueFrom(this.eventoService.getList(request))
            .then(eventos => {
                this.sugestaoReposicao = eventos.filter(ev => {
                    const temVagas = ev.vagasDisponiveisEvento > 0;
                    const ehPerfilCompativel = !aluno.perfilCognitivo_Id || ev.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)
                    const ehMesmoEvento = ev.id == evento.id
                        && moment(ev.data).isSame(evento.data, 'minute')
                        && ev.turma_Id == ev.turma_Id
                    const alunoEstaNaAula = ev.alunos.filter(x => x.active).map(x => x.aluno_Id).includes(aluno.id)
                    const ehFinalizado = ev.finalizado;
                    const ehAtivo = ev.active;
                    const ehAula = [EventoTipo.Aula, EventoTipo.TurmaExtra].includes(ev.evento_Tipo_Id);

                    return temVagas
                        && ehPerfilCompativel
                        && !ehMesmoEvento
                        && !alunoEstaNaAula
                        && !ehFinalizado
                        && ehAtivo
                        && ehAula;
                })

            })

    }

    rejectEvento(model: NgModel) {
        model.control.setValue(null);
        this.evento = undefined;
        console.log('rejectEvento', 'setEvento')
        this.eventoService.setEvento(undefined)

    }

    getRestricoes(aluno: Aluno) {
        let restricoes = aluno.restricoes.filter(x => x.active).map(x => x.descricao)
        return restricoes.length ? restricoes.join(', ') : 'Nenhuma restrição';
    }

    getSalaAula(evento: Evento) {
        return this.salaAulaPipe.transform({
            sala_Id: evento.sala_Id,
            numeroSala: evento.numeroSala,
            andar: evento.andar
        })
    }

    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    getCorRoteiro(roteiro_Id?: number) {
        let roteiro = this.roteiros.find(x => x.id == roteiro_Id)
        return roteiro?.corLegenda;
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    eventoCalendarioSelected(evento: Evento) {
        this.evento = evento;
    }

    enviarMensagemFalta(e: any) {
        if (this.evento) {
            let participacao = this.evento.alunos.find(x => x.aluno_Id == this.aluno?.id) as Evento_Participacao_Aluno;
            this.mensagemWhatsapp.enviarMensagemFalta(this.evento, participacao, e);
        }
    }

    alunoContactadoChanged() {
        this.alunoContactado = !this.alunoContactado;
        if (!this.alunoContactado) {
            this.request.alunoContactado = undefined
        }
        else {
            this.request.alunoContactado = new Date;
        }
    }

    sendConfirmation(form: NgForm, e: any) {

        if (!form.valid) {
            this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e);
            this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
            return;
        }

        // playAlert();

        let aluno = this.aluno as Aluno;
        let evento = this.evento as Evento;
        const data = moment(evento.data).format('DD/MM/YY [às] HH[h]mm');

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja marcar falta para o aluno <b>${aluno.nome} </b> do dia <b>${data}</b> na turma <b>${evento.descricao}</b>?`,
            header: 'Marcar Falta',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Marcar falta',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e, aluno, evento);
            },
            reject: () => {
            }
        });
    }

    async send(e: any, aluno: Aluno, evento: Evento) {

        this.loading = true;

        let response: RequestResponse = { success: true, message: '', object: undefined };

        let participacao = evento.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

        // Se a aula não existir, cria a aula
        if (evento.id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(evento)
            participacao = response.object.alunos.find((x: Evento_Participacao_Aluno) => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

            if (!response.success) {
                return this.showError('Falta não registrada', `Ocorreu um erro ao registrar falta. <br> ${response.message}`, e);
            }
        }

        this.request.participacao_Id = participacao.id;
        this.request.reposicaoDe_Evento_Id = participacao.reposicaoDe_Evento_Id;

        await lastValueFrom(this.eventoService.cancelarParticipacao(this.request))
            .then(res => {
                // playSuccess();
                this.loading = false;
                if (res.success) {
                    this.eventoService.calendarioReload.emit(res.object.id);
                    this.toastr.success(`A falta do dia ${moment(evento.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
                    if (aluno.celular) {
                        this.sendMensagemAluno(e, aluno, evento);
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

    sendMensagemAluno(e: any, aluno: Aluno, evento: Evento) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Falta registrada com sucesso. <br> Clique para enviar mensagem ao aluno.`,
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
                let url = this.mensagemWhatsapp.enviarMensagemAgendamentoFalta(aluno.nome, aluno.celular, evento, this.sugestaoReposicao);
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
