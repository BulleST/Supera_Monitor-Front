import { Component, OnDestroy, QueryList, ViewChildren } from '@angular/core'
import { Evento, EventoTipo } from '../../../models/evento.model'
import { ConfirmationService } from 'primeng/api'
import { lastValueFrom, Subscription } from 'rxjs'
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model'
import { Evento_Participacao_Professor } from '../../../models/evento-participacao-professor.model'
import { Aluno } from '../../../models/alunos.model'
import { Professor } from '../../../models/professor.model'
import { SalaAula } from '../../../models/sala-aula.model'
import { Turma } from '../../../models/turma.model'
import { ActivatedRoute, Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { SalaAulaService } from '../../../services/sala-aula.service'
import { Crypto, getError, MensagemWhatsapp, showError } from '../../../utils'
import { ProfessorService } from '../../../services/professor.service'
import { AlunoService } from '../../../services/alunos.service'
import { EventoService } from '../../../services/evento.service'
import { TurmaService } from '../../../services/turma.service'
import moment from 'moment'
import { NgForm } from '@angular/forms'
import { PseudoEvento } from '../../../models/reposicao.model'
import { CalendarioRequest } from '../../../models/calendario.model'
import { RoteiroService } from '../../../services/roteiro.service'
import { Roteiro } from '../../../models/roteiro.model'
import { FinalizarAulaZeroRequest, ParticipacaoAulaZeroModel } from '../../../models/evento-aula-0.model'
import { RequestResponse } from '../../../helpers/request-response.interface'
import { EventoChamadaRequest } from '../../../models/evento-chamada.model'
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../utils/validacao'
import { CalendarioUtils } from '../../../utils/calendario-utils'

@Component({
    selector: 'app-evento',
    standalone: false,
    templateUrl: './evento.component.html',
    styleUrl: './evento.component.css',
    providers: [ConfirmationService],
})
export class EventoComponent implements OnDestroy {
    evento: Evento = new Evento()
    // queryParams: EventoQueryParams = new EventoQueryParams;

    visible: boolean = false
    loading = false
    error: string = ''
    subscription: Subscription[] = []
    tipoString = ''
    duracaoEvento = ''
    width = '1000px'
    tipo = EventoTipo
    encryptedId = ''

    EventoTipo = EventoTipo;
    selectedAluno?: Evento_Participacao_Aluno
    mensagensEnviadasAlunos: Evento_Participacao_Aluno[] = []
    alunos: Aluno[] = []
    loadingAlunos = false

    professores: Professor[] = []
    loadingProfessores = false

    salaAulas: SalaAula[] = []
    loadingSalaAulas = false

    turmas: Turma[] = []
    loadingTurmas = false

    eventos: Evento[] = []
    loadingEventos = false

    roteiros: Roteiro[] = []
    loadingRoteiros = false

    @ViewChildren('componentForm') componentForm!: QueryList<any>

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private service: EventoService,
        private turmaService: TurmaService,
        private roteiroService: RoteiroService,
        private calendarioUtils: CalendarioUtils,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
        let params = this.activatedRoute.snapshot.params
        if (!params['evento_id'] || !params['evento_nome'] || !['aula', 'aula-zero', 'aula', 'superacao', 'reuniao', 'oficina'].includes(params['evento_nome'])) {
            this.visible = false
            this.visibleChange()
            return
        }

        this.encryptedId = params['evento_id']

        let roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res)
        this.subscription.push(roteiros)

        if (this.roteiros.length == 0) {
            this.loadingRoteiros = true
            lastValueFrom(this.roteiroService.getList())
                .then((res) => (this.loadingRoteiros = false))
                .catch((res) => (this.loadingRoteiros = false))
        }

        let professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active == true))
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadingProfessores = true
            lastValueFrom(this.professorService.getList())
                .then((res) => (this.loadingProfessores = false))
                .catch((res) => (this.loadingProfessores = false))
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res.filter(x => x.active == true))
        this.subscription.push(salaAula)

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true
            lastValueFrom(this.salaAulaService.getList())
                .then((res) => (this.loadingSalaAulas = false))
                .catch((res) => (this.loadingSalaAulas = false))
        }

        let alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true))
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAlunos = true
            lastValueFrom(this.alunoService.getList())
                .then((res) => (this.loadingAlunos = false))
                .catch((res) => (this.loadingAlunos = false))
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active == true))
        this.subscription.push(turmas)

        if (this.turmas.length == 0) {
            this.loadingTurmas = true
            lastValueFrom(this.turmaService.getList())
                .then((res) => (this.loadingTurmas = false))
                .catch((res) => (this.loadingTurmas = false))
        }

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true))
        this.subscription.push(eventos)

        let evento = this.service.getEvento().subscribe(async (res) => {
            if (res) {
                this.evento = res
                this.visible = true
                this.verificaDisponibilidade()
                this.tipoString = this.getTipo(this.evento)
                let alunosEvento = this.evento.alunos.map(x => x.aluno_Id)
                this.alunos = this.alunos.filter(x => alunosEvento.includes(x.id))

                if (this.evento.roteiro_Id == PseudoEvento.EventoId) {
                    let roteiro = this.roteiros.find(x => moment(this.evento.data).isBetween(x.dataInicio, x.dataFim, 'days', '[]'))
                    this.evento.roteiro_Id = roteiro?.id ?? PseudoEvento.EventoId
                }

                let minutos = this.evento.duracaoMinutos % 60
                let horas = this.evento.duracaoMinutos / 60
                let horaRedonda = horas - Math.floor(horas) == 0

                this.duracaoEvento = horaRedonda
                    ? horas.toString().padStart(2, '0') + 'h'
                    : horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';
            }
        })
        this.subscription.push(evento)
    }

    getDeactivatedInformation(evento: Evento) {
        return `${moment(evento.deactivated!).format('DD/MM/YYYY - HH:mm')}`
    }

    get roteiroEvento(): Roteiro | undefined {
        if (!this.evento?.roteiro_Id) return undefined;
        return this.roteiros.find(r => r.id === this.evento.roteiro_Id);
    }
    ngOnDestroy(): void {
        this.subscription.forEach((e) => e.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            let route = '../../../';
            this.router.navigate([route], { relativeTo: this.activatedRoute })

            this.service.setEvento(undefined)
        }
    }

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
    }

    async verificaDisponibilidade() {
        let valid = true

        this.loadingEventos = true
        let request: CalendarioRequest = new CalendarioRequest()

        request.intervaloDe = moment(this.evento.data, 'YYYY-MM-DD').toDate()
        request.intervaloAte = moment(this.evento.data, 'YYYY-MM-DD')
            .add(1, 'day')
            .toDate()

        this.loadingEventos = true
        await lastValueFrom(this.service.getList(request))
            .then((res) => (this.loadingEventos = false))
            .catch((res) => (this.loadingEventos = false))

        this.validaProfessores()
        this.validaSalaAulas()
        this.validaAlunos()

        return valid
    }

    validaSalaAulas() {
        let data = this.evento.data;
        this.salaAulas = validaSalaAulas(data, this.evento.duracaoMinutos, this.salaAulas, this.eventos, undefined, this.evento.id)
    }

    validaProfessores() {
        let data = this.evento.data
        this.professores = validaProfessores(data, this.evento.duracaoMinutos, this.professores, this.eventos, undefined, this.evento.id)
    }

    validaAlunos() {
        let data = this.evento.data
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, this.evento.id)
    }

    professorChanged(professor: Professor) {
        this.validaProfessores()
    }

    salaAulaChanged(salaAula: SalaAula) {
        this.validaSalaAulas()
    }

    alunoChanged(aluno: Aluno) {
        this.validaAlunos()
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    goToAluno(aluno: Evento_Participacao_Aluno) {
        this.router.navigate([
            'calendario',
            'aluno',
            this.crypto.encrypt(aluno.aluno_Id),
        ])
    }

    finalizarConfirmation(e: any) {

        let alunosPresentesSemPaginaDefinida = this.evento.alunos.filter(x => x.active === true 
            && x.presente === true
            && (x.numeroPaginaAH == 0 || x.numeroPaginaAbaco == 0)
        )

        if ([EventoTipo.Aula, EventoTipo.TurmaExtra].includes(this.evento.evento_Tipo_Id) 
            && alunosPresentesSemPaginaDefinida.length > 0 ) {
            let mensagem = 'Os seguintes alunos(as) ganharam presença mas estão sem página definida. <ul class="pl-2 my-2">'
            alunosPresentesSemPaginaDefinida.forEach(item => {
                mensagem += `<li class="flex align-items-center flex-wrap white-space-nowrap gap-2"> `
                mensagem += `<p>${item.aluno}:</p>`
                mensagem += `- Pag. AH: ${item.numeroPaginaAH} `;
                mensagem += `- Pag. Ábaco: ${item.numeroPaginaAbaco} `;
                mensagem += '</li>';

                    
                })
            mensagem += '</ul>';
            return this.showError('Validar páginas', mensagem, e)
        }



        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja finalizar ${this.tipoString}? <br>Ao finalizar, não será possível alterar nenhuma informação.`,
            header: `Finalizar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptLabel: `Finalizar`,
            acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Ainda não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.finalizar(e)
            },
        })
    }

    async finalizar(e: any) {
        this.loading = true

        let response: RequestResponse = await this.request()
            .catch(res => {
                this.loading = false;
                return res
            })

        if (response.success) {
            this.evento.id = response.object.id
            this.evento.alunos = this.evento.alunos.map((participacao) => {
                let participacaoResponse = response.object.alunos.find((x: Evento_Participacao_Aluno) => x.aluno_Id == participacao.aluno_Id) as Evento_Participacao_Aluno;
                participacao.id = participacaoResponse.id
                participacao.evento_Id = participacaoResponse.evento_Id
                participacao.presente = participacao.presente ?? false;
                return participacao;
            })

            this.evento.professores = this.evento.professores.map((participacao) => {
                let participacaoResponse = response.object.professores.find((x: Evento_Participacao_Professor) => x.professor_Id == participacao.professor_Id) as Evento_Participacao_Professor;
                participacao.id = participacaoResponse.id
                participacao.evento_Id = participacaoResponse.evento_Id
                participacao.presente = [EventoTipo.Reuniao].includes(this.evento.evento_Tipo_Id) ? participacao.presente ?? false : true;
                return participacao;
            })

            let request: EventoChamadaRequest = {
                evento_Id: this.evento.id,
                observacao: this.evento.observacao,
                alunos: this.evento.alunos.map(x => {
                    return {
                        participacao_Id: x.id,
                        observacao: x.observacao,
                        presente: x.presente,
                        apostila_Abaco_Id: x.apostila_Abaco_Id,
                        apostila_AH_Id: x.apostila_AH_Id,
                        numeroPaginaAbaco: x.numeroPaginaAbaco,
                        numeroPaginaAH: x.numeroPaginaAH,
                    }
                }),
                professores: this.evento.professores.map((item) => {
                    return {
                        participacao_Id: item.id,
                        observacao: item.observacao,
                        presente: true,
                    }
                }),
            }

            if (this.evento.evento_Tipo_Id == EventoTipo.Reuniao) {
                request.professores = this.evento.professores.map(x => {
                    return {
                        participacao_Id: x.id,
                        observacao: x.observacao,
                        presente: x.presente,
                    }
                })
            }

            if (this.evento.evento_Tipo_Id == EventoTipo.AulaZero) {
                return this.finalizarAulaZero()
                    .then((res) => {
                        this.evento.finalizado = true
                        this.loading = false
                        this.visible = false
                        this.visibleChange()
                        this.service.calendarioReload.emit(this.evento.id)
                        this.markChecklistAsDone()

                        this.toastrService.success(
                            `${this.capitalizeFirstLetter(this.tipoString)} finalizada com sucesso.`,
                            'Sucesso',
                        )
                    })
                    .catch((res) => {
                        this.error = res.message
                        this.showError('Erro', `Não foi possível finalizar ${this.tipoString}.`, e, getError(res))
                        this.loading = false
                    })
            }

            lastValueFrom(this.service.finalizar(request))
                .then((res) => {
                    this.evento.finalizado = true
                    this.loading = false
                    this.visible = false
                    this.visibleChange()
                    this.service.calendarioReload.emit(this.evento.id)
                    this.markChecklistAsDone()

                    this.toastrService.success(
                        `${this.capitalizeFirstLetter(this.tipoString)} finalizada com sucesso.`,
                        'Sucesso',
                    )
                })
                .catch((res) => {
                    this.error = res.message
                    this.showError('Erro', `Não foi possível finalizar ${this.tipoString}.`, e, getError(res))
                    this.loading = false
                })
        }
    }

    capitalizeFirstLetter(input: string) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }

    sendConfirmation(e: any, form: NgForm) {
        if (form.invalid) {
            return this.showError('OPA!', `Não foi possível salvar! <br> Preencha os dados corretamente para continuar`, e);
        }

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja salvar?`,
            header: `Salvar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Salvar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.send(e)
            },
            reject: () => { },
        })
    }

     send(e: any) {
        this.loading = true
        this.request()
            .then((res) => {
                this.service.calendarioReload.emit(res.object.id)
                this.evento.id = res.object.id
                this.service.setEvento(this.evento)
                this.toastrService.success('Dados atualizados com sucesso.')
                this.router.navigate(['calendario'])
                this.loading = false
            })
            .catch((res) => {
                this.loading = false
                this.showError('OPA!', `Não foi possível salvar dados.`, e, getError(res))
            })
    }

    markChecklistAsDone() {
        this.componentForm.forEach((item) => {
            item.onSave.emit(this.evento)
        })
    }

    request() {
        let evento = this.evento;
        return this.calendarioUtils.request(evento);
    }

    buildFinalizarAulaZeroRequest(): FinalizarAulaZeroRequest {
        const alunos: ParticipacaoAulaZeroModel[] = this.evento.alunos.map(aluno => {
            const participacao: ParticipacaoAulaZeroModel = {
                participacao_Id: aluno.id,
                presente: aluno.presente || false,
                aluno_Id: aluno.aluno_Id,
                turma_Id: aluno.presente ? aluno.turma_Id || -1 : -1,
                perfilCognitivo_Id: aluno.presente ? aluno.perfilCognitivo_Id || -1 : -1,
                apostila_Kit_Id: aluno.presente ? aluno.apostila_Kit_Id || -1 : -1,
            };
            return participacao;
        });

        return {
            evento_Id: this.evento.id,
            observacao: this.evento.observacao,
            alunos: alunos,
        };
    }

    async finalizarAulaZero() {
        try {
            const request = this.buildFinalizarAulaZeroRequest();
            await lastValueFrom(this.service.finalizarAulaZero(request));

            this.evento.finalizado = true;
            this.visible = false;
            this.visibleChange();
            this.service.calendarioReload.emit(this.evento.id);

            this.markChecklistAsDone();

            this.toastrService.success(
                `${this.capitalizeFirstLetter(this.tipoString)} finalizada com sucesso.`,
                'Sucesso'
            );
        } catch (error: any) {
            this.error = error?.message || 'Erro desconhecido';
            this.showError(
                'Erro',
                `Não foi possível finalizar ${this.tipoString}.`,
                error,
                getError(error)
            );
        } finally {
            this.loading = false;
        }
    }
}
