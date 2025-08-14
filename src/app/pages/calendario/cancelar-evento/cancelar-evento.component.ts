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

import { MyMap } from '../../../utils/map'
import { Crypto, getError, showError } from '../../../utils'
import { CalendarioUtils } from '../../../utils/calendario-utils'
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp'

import { TurmaService } from '../../../services/turma.service'
import { AlunoService } from '../../../services/alunos.service'
import { EventoService } from '../../../services/evento.service'
import { ProfessorService } from '../../../services/professor.service'

import { RequestResponse } from '../../../helpers/request-response.interface'

import { Turma } from '../../../models/turma.model'
import { SalaAulaId } from '../../../models/sala-aula.model'
import { EventoAulaRequest } from '../../../models/evento-aula.model'
import { EventoOficinaRequest } from '../../../models/evento-oficina.model'
import { EventoReuniaoRequest } from '../../../models/evento-reuniao.model'

@Component({
  selector: 'app-cancelar-evento',
  standalone: false,
  templateUrl: './cancelar-evento.component.html',
  styleUrl: './cancelar-evento.component.css',
  providers: [ConfirmationService],
})
export class CancelarEventoComponent implements OnDestroy {
  evento: Evento = new Evento()
  visible: boolean = false
  loading = false
  error: string = ''
  subscription: Subscription[] = []
  tipoEventoString = ''

  mensagensEnviadasAlunos: Evento_Participacao_Aluno[] = []
  alunos: Evento_Participacao_Aluno[] = []

  professores: Professor[] = []
  loadingProfessores = false

  turmas: Turma[] = []
  loadingTurmas = false
  SalaAulaId = SalaAulaId

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private toastrService: ToastrService,
    private crypto: Crypto,
    private professorService: ProfessorService,
    private alunoService: AlunoService,
    private service: EventoService,
    private mensagemWhatsapp: MensagemWhatsapp,
    private calendarioUtils: CalendarioUtils,
    private turmaService: TurmaService,
  ) {
    var professores = this.professorService.list.subscribe(res => {
      this.professores = res.filter(x => x.active == true)
      this.setAlunosProfessores()
    })
    this.subscription.push(professores)

    if (this.professores.length == 0) {
      this.loadingProfessores = true
      lastValueFrom(this.professorService.getList())
        .then(res => (this.loadingProfessores = false))
        .catch(res => (this.loadingProfessores = false))
    }

    var turmas = this.turmaService.list.subscribe(res => (this.turmas = res.filter(x => x.active == true)))
    this.subscription.push(turmas)

    if (this.turmas.length == 0) {
      this.loadingTurmas = true
      lastValueFrom(this.turmaService.getList())
        .then(res => (this.loadingTurmas = false))
        .catch(res => (this.loadingTurmas = false))
    }

    var eventos = this.service.evento.subscribe(res => {
      if (!res) {
        try {
          var evento = JSON.parse(localStorage.getItem('evento') ?? '')
          this.service.setEvento(evento)
        } catch (e) {
          this.visible = false
          this.visibleChange()
        }
        return
      }
      if (res) {
        this.evento = res
        this.tipoEventoString = this.getTipo(this.evento)
        this.setAlunosProfessores()
        this.visible = true
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
      var professoresEvento = this.evento.professores.map(x => x.professor_Id)
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

  goToReagendamento() {
    if (this.evento) {
      this.service.setEvento(this.evento)

      var route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula'
      switch (this.evento.evento_Tipo_Id) {
        case EventoTipo.Aula:
          route = 'aula'
          break
        case EventoTipo.AulaZero:
          route = 'aula-zero'
          break
        case EventoTipo.AulaExtra:
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

  enviarMensagemCancelamento(aluno: Evento_Participacao_Aluno) {
    if (!aluno.celular) {
      this.showError('Erro', 'Nenhum celular cadastrado', aluno)
      return
    }

    if (this.evento?.observacao && this.evento.observacao.length < 3) {
      this.showError('Erro', 'Insira um motivo para o cancelamento. Pelo menos 3 caracteres.', aluno)
      return
    }

    let object = this.mensagemWhatsapp.enviarMensagemCancelamento(aluno.aluno, aluno.celular, this.evento)

    window.open(object.link, '_blank')

    this.mensagemWhatsapp.copiarMensagem(object.mensagem)

    var index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)

    if (index != -1) {
      this.mensagensEnviadasAlunos.splice(index, 1)
    }
  }

  enviarMensagem(aluno: Evento_Participacao_Aluno) {
    if (!aluno.celular) {
      this.showError('Erro', 'Nenhum celular cadastrado', aluno)
      return
    }

    if (!this.evento.observacao) {
      this.showError('Erro', 'Insira um motivo para o cancelamento.', aluno)
      return
    }

    if (this.evento?.observacao && this.evento.observacao.length < 3) {
      this.showError('Erro', 'Insira um motivo para o cancelamento. Pelo menos 3 caracteres.', aluno)
      return
    }

    let object = this.mensagemWhatsapp.enviarMensagemCancelamento(aluno.aluno, aluno.celular, this.evento)
    window.open(object.link, '_blank')
    this.mensagemWhatsapp.copiarMensagem(object.mensagem)
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
    var response: RequestResponse = { success: true, message: '', object: null }

    if (this.evento.id == PseudoEvento.EventoId) {
      await this.request()
        .then(res => {
          this.evento.id = res.object.id
          response = res
        })
        .catch(res => this.showError('Erro', getError(res), e))
    }

    if (response.success) {
      var request: EventoCancelamentoRequest = {
        id: this.evento.id,
        observacao: this.evento.observacao,
      }
      lastValueFrom(this.service.cancelar(request))
        .then(res => {
          this.toastrService.success(`A ${this.tipoEventoString} foi cancelada com sucesso`, 'Cancelamento realizado')
          this.service.calendarioReload.emit(res.object.id)
          this.loading = false

          if (this.evento.alunos.length > 0) {
            this.sendMensagemAlunos()
          } else {
            this.visible = false
            this.visibleChange()
          }
        })
        .catch(res => {
          this.showError('Erro', `Não foi possível cancelar a ${this.tipoEventoString}. <br> ${getError(res)}`, e)
        })
    }
  }

  request() {
    this.evento.data = new Date(this.evento.data)
    switch (this.evento.evento_Tipo_Id) {
      case EventoTipo.Aula:
        return this.requestAulaTurma()
      case EventoTipo.Reuniao:
        return this.requestReuniao()
      case EventoTipo.Oficina:
        return this.requestOficina()
      default:
        return this.requestAulaTurma()
    }
  }

  requestAulaTurma() {
    var request: EventoAulaRequest = MyMap(this.evento, new EventoAulaRequest())
    request.alunos = this.evento.alunos.map(x => x.aluno_Id)
    request.professores = this.evento.professor_Id ? [this.evento.professor_Id] : []
    request.perfilCognitivo = this.evento.perfilCognitivo.map(x => x.id)
    request.sala_Id = request.sala_Id ?? 13 // online;

    if (this.evento.id == PseudoEvento.EventoId) return lastValueFrom(this.service.createAulaTurma(request))
    return lastValueFrom(this.service.editAulaTurma(request))
  }

  requestReuniao() {
    var request = MyMap(this.evento, new EventoReuniaoRequest())
    request.alunos = this.evento.alunos.map(x => x.aluno_Id)
    request.professores = this.evento.professores.map(x => x.professor_Id)
    request.sala_Id = request.sala_Id ?? 14 // professores;

    if (this.evento.id == PseudoEvento.EventoId) return lastValueFrom(this.service.createReuniao(request))
    return lastValueFrom(this.service.editReuniao(request))
  }

  requestOficina() {
    var request = MyMap(this.evento, new EventoOficinaRequest())
    request.alunos = this.evento.alunos.map(x => x.aluno_Id)
    request.professores = this.evento.professores.map(x => x.professor_Id)
    request.sala_Id = request.sala_Id ?? 13 // online;
    if (this.evento.id == PseudoEvento.EventoId) return lastValueFrom(this.service.createOficina(request))
    return lastValueFrom(this.service.editOficina(request))
  }

  sendMensagemAlunos() {
    this.mensagensEnviadasAlunos = this.evento!.alunos.sort((x, y) => (x.aluno < y.aluno ? -1 : 1))
    this.confirmationService.confirm({
      key: 'enviarMensagemCancelamento',
      message: `A ${this.tipoEventoString} foi cancelada \n Clique no(s) aluno(s) para enviar mensagem de cancelamento.`,
      header: 'Enviar whatsapp',
      icon: 'pi pi-whatsapp text-green-500',
      acceptLabel: `Concluir`,
      acceptIcon: 'pi pi-check',
      acceptButtonStyleClass: 'p-button-rounded',
      rejectVisible: false,
      accept: () => {
        this.visible = false
        this.visibleChange()
      },
    })
  }
}
