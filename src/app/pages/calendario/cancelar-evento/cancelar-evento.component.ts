import { NgForm } from '@angular/forms'
import { Component, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import moment from 'moment'
import { ToastrService } from 'ngx-toastr'
import { ConfirmationService } from 'primeng/api'
import { lastValueFrom, Subscription } from 'rxjs'

import { Professor } from '../../../models/professor.model'
import { PseudoEvento } from '../../../models/reposicao.model'
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model'
import { Evento, EventoCancelamentoRequest, EventoTipo } from '../../../models/evento.model'

import { Crypto, getError, showError } from '../../../utils'
import { CalendarioUtils } from '../../../utils/calendario-utils'
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp'

import { TurmaService } from '../../../services/turma.service'
import { EventoService } from '../../../services/evento.service'
import { ProfessorService } from '../../../services/professor.service'

import { RequestResponse } from '../../../helpers/request-response.interface'

import { Turma } from '../../../models/turma.model'
import { SalaAulaId, SalaAndar } from '../../../models/sala-aula.model'
import { Aluno } from '../../../models/alunos.model'
import { AlunoService } from '../../../services/alunos.service'
import { MensagemTipo } from '../../../shared/evento/enviar-mensagem-alunos/enviar-mensagem-alunos.component'
import { DialogService } from 'primeng/dynamicdialog'
import { showEnviarMensagemAlunos } from '../../../utils/show-enviar-mensagem-alunos'
import { JornadaSuperaService } from '../../../services/jornada-supera.service'
import { MonitoramentoService } from '../../../services/monitoramento.service'
import { SalaAulaPipe } from '../../../utils/sala-aula.pipe'

@Component({
    selector: 'app-cancelar-evento',
    standalone: false,
    templateUrl: './cancelar-evento.component.html',
    styleUrl: './cancelar-evento.component.css',
    providers: [ConfirmationService, DialogService],
})
export class CancelarEventoComponent implements OnDestroy {
    evento: Evento = new Evento();
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    tipoEventoString = '';
    EventoTipo = EventoTipo;

    alunos: Aluno[] = [];
    loadingAlunos = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    turmas: Turma[] = [];
    loadingTurmas = false;
    SalaAulaId = SalaAulaId;
    SalaAndar = SalaAndar;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto,
        private professorService: ProfessorService,
        private eventoService: EventoService,
        private jornadaService: JornadaSuperaService,
        private monitoramentoService: MonitoramentoService,
        private dialogService: DialogService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private turmaService: TurmaService,
        private alunoService: AlunoService,
        private salaAulaPipe: SalaAulaPipe,

    ) {
        let professores = this.professorService.list.subscribe(res => {
            this.professores = res;
            this.setAlunosProfessores()
        })
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadingProfessores = true
            lastValueFrom(this.professorService.getList())
                .then(res => (this.loadingProfessores = false))
                .catch(res => (this.loadingProfessores = false))
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res)
        this.subscription.push(turmas)

        if (this.turmas.length == 0) {
            this.loadingTurmas = true
            lastValueFrom(this.turmaService.getList())
                .then(res => (this.loadingTurmas = false))
                .catch(res => (this.loadingTurmas = false))
        }

        let alunos = this.alunoService.list.subscribe(res => this.alunos = res);
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAlunos = true
            lastValueFrom(this.alunoService.getList())
                .then(res => (this.loadingAlunos = false))
                .catch(res => (this.loadingAlunos = false))
        }

        let eventos = this.eventoService.getEvento().subscribe(res => {
            if (res) {
                this.evento = res
                this.tipoEventoString = this.getTipo(this.evento)
                this.setAlunosProfessores()
                this.visible = true
            }
            else {
                this.visible = false
                this.visibleChange()
            }
        })
        this.subscription.push(eventos)

        this.activatedRoute.params.subscribe(res => {
            if (
                !res['evento_id'] ||
                !res['evento_nome'] ||
                !['aula', 'aula-zero', 'aula', 'superacao', 'reuniao', 'oficina'].includes(res['evento_nome'])
            ) {
                this.visible = false
                this.visibleChange()
                return
            }
        })
        setTimeout(() => {
            if (!this.evento) {
                this.visible = false
                this.visibleChange()
            }
        }, 1000)
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../../'], { relativeTo: this.activatedRoute })
        }
    }

    setAlunosProfessores() {
        if (this.professores.length > 0 && this.evento.professores.length > 0) {
            let professoresEvento = this.evento.professores.map(x => x.professor_Id)
            this.professores = this.professores.filter(x => professoresEvento.includes(x.id))
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e)
    }

    getTipo(e: Evento) {
        e.evento_Tipo_Id = this.evento.evento_Tipo_Id
        return this.calendarioUtils.getEventoTipo(e)
    }

    getPerfilCognitivo(evento: Evento) {
        if (!evento.perfilCognitivo.length)
            return 'Indefinido'
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    getSala(evento: Evento) {
        return this.salaAulaPipe.getFullDescription(evento);
    }

    goToReagendamento() {
        if (this.evento) {
            this.eventoService.setEvento(this.evento)

            let route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula'
            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.Aula:
                    route = 'aula'
                    break
                case EventoTipo.AulaZero:
                    route = 'aula-zero'
                    break
                case EventoTipo.TurmaExtra:
                    route = 'aula'
                    break
                case EventoTipo.Superacao:
                    route = 'superacao'
                    break
                case EventoTipo.Reuniao:
                    route = 'reuniao'
                    break
                case EventoTipo.Oficina:
                    route = 'oficina'
                    break
                default:
                    route = 'aula'
                    break
            }

            this.router.navigate(['calendario', route, 'reagendar', this.crypto.encrypt(this.evento.id)])
        }
    }


    sendConfirmation(e: any, form: NgForm) {
        if (form.invalid) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e)
        }

        // playAlert();
        this.confirmationService.confirm({
            target: e.target,
            header: `Cancelar ${this.tipoEventoString}`,
            message: `Tem certeza que deseja cancelar a ${this.tipoEventoString} do dia ${moment(this.evento.data).format(
                'DD/MM/YY [às] HH[h]mm',
            )}?`,
            rejectLabel: 'Não cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            acceptIcon: 'pi pi-check',
            acceptLabel: `Cancelar ${this.tipoEventoString}`,
            acceptButtonStyleClass: 'p-button-rounded',
            accept: () => {
                this.send(e)
            },
            reject: () => {
                this.visible = false
                this.visibleChange()
            },
        })
    }

    async send(e: any) {
        this.loading = true
        let response: RequestResponse = { success: true, message: '', object: null }

        if (this.evento.id == PseudoEvento.EventoId) {
            await this.request()
                .then(res => {
                    this.evento.id = res.object.id
                    response = res
                })
                .catch(res => {
                    this.loading = false;
                    this.showError('Erro', getError(res), e)
                    return res;

                })
        }

        if (response.success) {
            let request: EventoCancelamentoRequest = {
                id: this.evento.id,
                observacao: this.evento.observacao,
            }
            lastValueFrom(this.eventoService.cancelar(request))
                .then(res => {
                    this.loading = false;
                    if (res.success) {
                        this.toastrService.success(`A ${this.tipoEventoString} foi cancelada com sucesso`, 'Cancelamento realizado')
                        this.jornadaService.onReload.emit();
                        this.monitoramentoService.onReload.emit();
                        this.eventoService.onReload.emit()

                        if (this.evento.alunos.length > 0) {
                            this.sendMensagemAlunos(res.object)
                        } else {
                            this.visible = false
                            this.visibleChange()
                        }
                    }
                    else {
                        this.showError('Erro', `Não foi possível cancelar a ${this.tipoEventoString}. <br> ${res.message}`, e)
                    }
                })
                .catch(res => {
                    this.loading = false;
                    this.showError('Erro', `Não foi possível cancelar a ${this.tipoEventoString}. <br> ${getError(res)}`, e)
                })
        }
    }

    request() {
        let evento = this.evento;
        return this.calendarioUtils.request(evento);
    }

    sendMensagemAlunos(evento: Evento) {
        var eventoAlunos = evento.alunos.map(x => x.aluno_Id);
        var alunos = this.alunos
            .filter(x => eventoAlunos.includes(x.id))
            .sort((x, y) => x.nome < y.nome ? -1 : 1);

        var ref = showEnviarMensagemAlunos(
            this.dialogService,
            alunos, evento,
            MensagemTipo.Cancelamento
        );

        var onClose = ref.onClose.subscribe(res => {
            this.visible = false;
            this.visibleChange();
        });
        this.subscription.push(onClose);
    }


    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno)
            return
        }

        let object = this.mensagemWhatsapp.enviarMensagemCancelamento(aluno.aluno, aluno.celular, this.evento)
        window.open(object.link, '_blank')
        this.mensagemWhatsapp.copiarMensagem(object.mensagem)
    }

}
