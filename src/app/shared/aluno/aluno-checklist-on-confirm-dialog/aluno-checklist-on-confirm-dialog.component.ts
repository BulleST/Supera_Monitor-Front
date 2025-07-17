import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { Checklist_Item } from '../../../models/checklist.model'
import { ChecklistService } from '../../../services/checklist.service'
import { ToastrService } from 'ngx-toastr'
import { ConfirmationService } from 'primeng/api'
import { MensagemWhatsapp, showError } from '../../../utils'
import { lastValueFrom } from 'rxjs'
import { Aluno } from '../../../models/alunos.model'
import { AlunoService } from '../../../services/alunos.service'
import { UserService } from '../../../services/user.service'

@Component({
  selector: 'app-aluno-checklist-on-confirm-dialog',
  standalone: false,
  templateUrl: './aluno-checklist-on-confirm-dialog.component.html',
  styleUrl: './aluno-checklist-on-confirm-dialog.component.css',
  providers: [ConfirmationService],
})
export class AlunoChecklistOnConfirmDialogComponent implements OnChanges {
  visible = false
  observacao = ''
  celular = ''
  loading = false

  @Input() aluno!: Aluno
  @Input() alunoChecklistItem: any //Aluno_CheckList_Item | Aluno_Checklist_Item_View;
  @Input() item!: Checklist_Item

  @Output() onCancel = new EventEmitter<boolean>()
  @Output() onFinish = new EventEmitter<any>()

  constructor(
    private service: ChecklistService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private mensagemWhatsapp: MensagemWhatsapp,
    private alunoService: AlunoService,
    private userService: UserService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alunoChecklistItem']) {
      this.alunoChecklistItem = changes['alunoChecklistItem'].currentValue
      this.celular = this.alunoChecklistItem?.celular
    }
    if (changes['item']) {
      this.item = changes['item'].currentValue
    }
    if (changes['aluno']) {
      this.aluno = changes['aluno'].currentValue
      this.celular = this.aluno?.celular
      this.cdr.markForCheck() // Marca para verificação na próxima detecção
      this.cdr.detectChanges()
    }
  }

  show(aluno?: Aluno) {
    this.visible = true
    if (aluno) {
      this.aluno = aluno
    }
    if (!this.aluno) {
      this.loadAluno()
    }
  }

  hide() {
    this.visible = false
    this.cdr.markForCheck() // Marca para verificação na próxima detecção
    this.cdr.detectChanges()
  }

  onHide() {
    this.onCancel.emit(false)
  }

  showError(header: string, message: string, e: any, error: any) {
    showError(this.confirmationService, header, message, e, error.toString())
  }

  async loadAluno() {
    this.loading = true

    await lastValueFrom(this.alunoService.get(this.alunoChecklistItem.aluno_Id))
      .then(res => {
        this.aluno = res
        this.celular = res.celular
        this.loading = false
      })
      .catch(res => {
        console.error('Não foi possível carregar aluno em aluno-checklist-on-confirm-dialog.component.ts')
        this.loading = false
      })

    this.cdr.markForCheck() // Marca para verificação na próxima detecção
    this.cdr.detectChanges()
  }

  async refreshChecklistItem() {
    if (!this.aluno?.id) return
    try {
      const items = await lastValueFrom(this.service.getChecklistAluno(this.aluno.id))
      // Find the updated checklist item by id or checklist_Item_Id
      const updated = items.find(
        (item: any) =>
          item.id === this.alunoChecklistItem.id ||
          item.checklist_Item_Id === this.alunoChecklistItem.checklist_Item_Id,
      )
      if (updated) {
        this.alunoChecklistItem = updated
      }
    } catch (e) {
      // Optionally handle error
      console.error('Erro ao atualizar checklist item', e)
    }
    this.cdr.markForCheck()
    this.cdr.detectChanges()
  }

  async send(e: any) {
    this.loading = true
    this.alunoChecklistItem.observacoes = this.observacao
    lastValueFrom(this.service.markAsDone(this.alunoChecklistItem.id, this.alunoChecklistItem.observacoes))
      .then(async res => {
        this.observacao = ''
        this.loading = false
        this.toastr.success(`Checklist ${this.alunoChecklistItem.nome} finalizado com sucesso!`)

        this.onFinish.emit(true)

        this.userService.get(res.object.account_Finalizacao_Id).then(async user => {
          res.object.account_Finalizacao = user.name
          this.onFinish.emit(res.object)
          this.service.onFinish.emit(res.object)
          // Refresh checklist item before hiding
          await this.refreshChecklistItem()
          this.hide()
        })
      })
      .catch(res => {
        this.showError('Erro', 'Não foi possível finalizar o checklist.', e, res)
        this.hide()
        console.log(res)
        this.onCancel.emit(true)
      })
  }

  enviarMensagemCondicao() {
    let id = this.alunoChecklistItem.checklist_Item_Id
    let aluno = {
      nome: this.aluno?.nome ?? this.alunoChecklistItem.aluno,
      celular: this.aluno?.celular ?? this.alunoChecklistItem.celular,
      email: this.aluno?.email ?? this.alunoChecklistItem.email,
      diaSemana: this.aluno?.diaSemana ?? this.alunoChecklistItem.diaSemana,
      horario: this.aluno?.horario ?? this.alunoChecklistItem.horario,
      professor: this.aluno?.professor ?? this.alunoChecklistItem.professor,
      linkGrupo: this.aluno?.linkGrupo ?? this.alunoChecklistItem.linkGrupo,
    }

    this.mensagemWhatsapp.enviarMensagemCondicao(aluno, id)
  }
}
