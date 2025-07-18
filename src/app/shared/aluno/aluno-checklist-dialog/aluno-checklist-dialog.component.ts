import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core'
import { Aluno } from '../../../models/alunos.model'
import { Aluno_CheckList_Item } from '../../../models/checklist.model'
import $ from 'jquery'
import { AlunoChecklistOnConfirmDialogComponent } from '../aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component'
import { NgModel } from '@angular/forms'
import { MensagemWhatsapp } from '../../../utils'
import { AlunoService } from '../../../services/alunos.service'

@Component({
  selector: 'app-aluno-checklist-dialog',
  standalone: false,
  templateUrl: './aluno-checklist-dialog.component.html',
  styleUrl: './aluno-checklist-dialog.component.css',
})
export class AlunoChecklistDialogComponent implements OnChanges {
  @Input() aluno!: Aluno
  @Input() loading = false
  @Output() onChecklistMark = new EventEmitter<any>()

  visible = false
  scrollLeft: number = 0

  selectedAlunoChecklistItem?: Aluno_CheckList_Item
  @ViewChild('alunoChecklistOnConfirmDialog') alunoChecklistOnConfirmDialog!: AlunoChecklistOnConfirmDialogComponent

  constructor(
    private mensagemWhatsapp: MensagemWhatsapp,
    private changeDetectorRef: ChangeDetectorRef,
    private alunoService: AlunoService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aluno']) {
      this.aluno = changes['aluno'].currentValue
    }
    if (changes['loading']) {
      this.loading = changes['loading'].currentValue
    }
}
    
    
    visibleChanged() {
        if (this.visible) {
            const tab = $(`p-tab[ng-reflect-value="${this.aluno.checklist_Id ?? 1}"]`).last()
            this.scrollLeft = $(tab).offset()?.left ?? 0
            $('.p-tablist-viewport').animate({
                scrollLeft: this.scrollLeft
            }, 300)
        }
    }
    
    show(aluno: Aluno) {
        this.aluno = aluno;
        this.visible = true;
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    }
    
    hide() {
        this.visible = false;
        this.changeDetectorRef.detectChanges();
    }
    
    checkboxMark(alunoChecklistItem: Aluno_CheckList_Item, model: NgModel) {
        this.selectedAlunoChecklistItem = alunoChecklistItem;
        this.alunoChecklistOnConfirmDialog.alunoChecklistItem = alunoChecklistItem;
        this.alunoChecklistOnConfirmDialog.aluno = this.aluno;
        this.alunoChecklistOnConfirmDialog.show(this.aluno, alunoChecklistItem);
        
        const onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
            console.log('onCancel')
            model.control.setValue(false);
            model.control.updateValueAndValidity();
            this.alunoChecklistOnConfirmDialog.hide();
            onCancel.unsubscribe();
            onFinish.unsubscribe();
        });
        
        const onFinish = this.alunoChecklistOnConfirmDialog.onFinish.subscribe(res => {
            
            console.log('onFinish')
            alunoChecklistItem.observacoes = res.observacoes;
            alunoChecklistItem.dataFinalizacao = res.dataFinalizacao;
            alunoChecklistItem.account_Finalizacao_Id = res.account_Finalizacao_Id;
            alunoChecklistItem.account_Finalizacao = res.account_Finalizacao;
            onCancel.unsubscribe();
            onFinish.unsubscribe();
        });
        
    }
    
    
    enviarMensagem(alunoChecklistItem: Aluno_CheckList_Item, aluno: Aluno) {
        const id = alunoChecklistItem.checklist_Item_Id;
        this.mensagemWhatsapp.enviarMensagemCondicao(aluno, id);
    }
    
}
