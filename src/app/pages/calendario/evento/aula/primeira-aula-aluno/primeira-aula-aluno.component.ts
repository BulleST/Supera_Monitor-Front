import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnDestroy, AfterViewInit } from '@angular/core'

import { ConfirmationService } from 'primeng/api'

import moment from 'moment'
import { ToastrService } from 'ngx-toastr'
import { lastValueFrom, Subscription } from 'rxjs'

import {
    PseudoEvento,
    PrimeiraAulaRequest,
} from '../../../../../models/reposicao.model'
import { Aluno } from '../../../../../models/alunos.model'
import { Roteiro } from '../../../../../models/roteiro.model'
import { Feriado } from '../../../../../models/feriado.model'
import { Evento, EventoTipo } from '../../../../../models/evento.model'
import { EventoAulaRequest } from '../../../../../models/evento-aula.model'
import { PerfilCognitivo } from '../../../../../models/perfil-cognitivo.model'
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model'

import { showError } from '../../../../../utils'
import { MyMap } from '../../../../../utils/map'
import { CalendarioUtils } from '../../../../../utils/calendario-utils'
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp'
import { RequestResponse } from '../../../../../helpers/request-response.interface'

import { AlunoService } from '../../../../../services/alunos.service'
import { EventoService } from '../../../../../services/evento.service'
import { ChecklistService } from '../../../../../services/checklist.service'
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model'
import { AccountService } from '../../../../../services/account.service'
@Component({
    selector: 'app-agendar-primeira-aula-aluno',
    standalone: false,
    templateUrl: './primeira-aula-aluno.component.html',
    styleUrl: './primeira-aula-aluno.component.css',
    providers: [ConfirmationService],
})
export class PrimeiraAulaAlunoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = false
    loading = false
    error: string = ''
    subscription: Subscription[] = []
    legenda: { corLegenda: string; label: string }[] = []

    selectedAula?: any
    selectedEvento?: Evento
    EventoTipo = EventoTipo
    restricaoCheck: boolean = false

    aluno: Aluno = new Aluno()
    // participacao: Evento_Participacao_Aluno = new Evento_Participacao_Aluno()
    evento: Evento = new Evento()
    eventos: Evento[] = []
    tipoString = ''
    corLegenda: string = ''

    currentTitle: string = ''
    roteiros: Roteiro[] = []
    loadingRoteiro = false

    feriados: Feriado[] = []
    loadingFeriados = false

    alunos: Aluno[] = []
    loadingAlunos = false
    selectedAluno?: Aluno = undefined

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,

        private service: EventoService,
        private alunoService: AlunoService,
        private toastrService: ToastrService,
        private confirmationService: ConfirmationService,
        private calendarioUtils: CalendarioUtils,
        private checklistService: ChecklistService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private accountService: AccountService,
    ) {
        let alunos = this.alunoService.list.subscribe(res => {
            let perfilEvento = this.evento.perfilCognitivo.flatMap((a) => a.id);
            this.alunos = res.filter((x) => x.active === true
                && x.primeiraAula_Id === null
                && perfilEvento.includes(x.perfilCognitivo_Id))
        })
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAlunos = true
            lastValueFrom(this.alunoService.getList())
                .then(() => {
                    let perfilEvento = this.evento.perfilCognitivo.flatMap((a) => a.id);
                    this.alunos = this.alunos.filter((aluno) => aluno.primeiraAula_Id === null
                        && aluno.primeiraAula_Id === null
                        && perfilEvento.includes(aluno.perfilCognitivo_Id));

                })
                .then((res) => (this.loadingAlunos = false))
                .catch((res) => (this.loadingAlunos = false))
        }

        let evento = this.service.evento.subscribe((res) => {
            if (!res) {
                try {
                    let evento = JSON.parse(localStorage.getItem('evento') ?? '')
                    this.service.setEvento(evento)
                } catch (e) {
                    this.visible = false
                    this.visibleChange()
                }
                return
            }
            if (res) {
                this.evento = res
                this.tipoString = this.getTipo(this.evento);

                if (this.evento.capacidadeMaximaAlunos == this.evento.alunos.length) {
                    let eventoAlunos = this.evento.alunos.map(x => x.aluno_Id);
                    this.alunos = this.alunos.filter(x => eventoAlunos.includes(x.id))
                }

                // this.participacao = this.evento.alunos.find((x) => x.aluno_Id == this.participacao.aluno_Id) as Evento_Participacao_Aluno
                this.visible = true
            }
        })
        this.subscription.push(evento)

        setTimeout(() => {
            if (!this.evento) {
                this.visible = false
                this.visibleChange()
            }
        }, 1000)
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            let route = ['../../../']
            this.router.navigate(route, { relativeTo: this.activatedRoute })
        }
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        if (!perfilCognitivo || perfilCognitivo.length == 0) return ''
        return perfilCognitivo.map((x) => x.nome).join(', ')
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
        if (!this.selectedAluno) {
            this.toastrService.error('Selecione um aluno')
        } else {
            let data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar primeira aula do aluno <b>${this.aluno.nome} </b> para o dia <b>${data}</b>?`,
                header: 'Agendar primeira aula',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Agendar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    this.send(e)
                },
                reject: () => { },
            })
        }
    }

    async send(e: any) {
        this.loading = true

        let request = new PrimeiraAulaRequest()
        request.aluno_Id = this.selectedAluno!.id
        request.evento_Id = this.evento.id

        let response: RequestResponse = {
            success: true,
            message: '',
            object: undefined,
        }

        // Se a aula target não existir, cria a aula
        if (request.evento_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(this.evento)
            request.evento_Id = response.object.id
            if (!response.success) {
                return this.showError(
                    'Primeira aula não agendada',
                    `Ocorreu um erro ao agendar primeira aula. <br> ${response.message}`,
                    e,
                )
            }
        }

        lastValueFrom(this.alunoService.primeiraAula(request))
            .then(response => {
                if (response.success) {
                    this.service.calendarioReload.emit(request.evento_Id);
                    this.toastrService.success(response.message);
                    this.markChecklistAsDone();

                    if (this.selectedAluno?.celular) {
                        this.sendMensagemAluno(e, this.evento);
                    } else {
                        this.visible = false
                        this.visibleChange()
                    }

                } else {
                    this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, response.message)
                }

            })
            .catch(res => {
                this.loading = false;
                this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, res.message)
            })
    }


    requestAulaTurma(evento: Evento) {

        let request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest())
        request.alunos = evento.alunos.map((x) => x.aluno_Id)
        request.professores = evento.professor_Id ? [evento.professor_Id] : []
        request.perfilCognitivo = evento.perfilCognitivo.map((x) => x.id)
        request.data = moment(new Date(request.data)).format(
            'YYYY-MM-DD[T]HH:mm',
        ) as any

        return lastValueFrom(this.service.createAulaTurma(request))
    }

    sendMensagemAluno(e: any, evento: Evento) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Primeira aula agendada com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptIcon: 'pi pi-whatsapp',
            rejectIcon: 'pi pi-times',
            acceptLabel: `Enviar mensagem`,
            rejectLabel: 'Não enviar',
            acceptButtonStyleClass: 'p-button-rounded p-button-success',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange()
                let object = this.mensagemWhatsapp.enviarMensagemAgendamento(this.aluno.nome, this.aluno.celular, evento)
                window.open(object.link, '_target')
                this.mensagemWhatsapp.copiarMensagem(object.mensagem)
            },
            reject: () => {
                this.visible = false
                this.visibleChange()
            },
        })
    }

    markChecklistAsDone() {
        let aluno = this.aluno as Aluno;
        // Agendamento na 1ª aula 
        if (aluno) {
            let id = 38;
            let alunoChecklist = aluno.alunoChecklist.find((x) => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
            let professor = this.evento.professor;
            let data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
            let account = this.accountService.accountValue;

            if (alunoChecklist && !alunoChecklist.finalizado) {
                let mensagem = `Aula 0 agendada para o dia ${data} com o educador(a) ${professor}.\n Agendamento realizado por ${account?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')}}`;
                if (alunoChecklist && !alunoChecklist.finalizado) {
                    lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem));
                }
            }
        }
    }
}
