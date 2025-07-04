import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { Subscription } from 'rxjs';
import { MensagemWhatsapp } from '../../../../../utils';
import { Aluno } from '../../../../../models/alunos.model';
import { AlunoChecklistCompleto } from '../../../../../models/calendario.model';
import { Aluno_CheckList_Item, Checklist_Item } from '../../../../../models/checklist.model';
import { AlunoChecklistOnConfirmDialogComponent } from '../../../../../shared/aluno/aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
import { NgModel } from '@angular/forms';
import { ChecklistService } from '../../../../../services/checklist.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-checklist-popover-jornada',
    standalone: false,
    templateUrl: './checklist-popover.component.html',
    styleUrl: './checklist-popover.component.css'
})
export class ChecklistPopoverComponent implements OnDestroy, OnChanges {

    @Input() checklist!: AlunoChecklistCompleto;
    @Input() aluno!: Aluno;

    subscription: Subscription[] = [];

    @ViewChild('popover') popover!: Popover;
    @ViewChild('alunoChecklistOnConfirmDialog') alunoChecklistOnConfirmDialog!: AlunoChecklistOnConfirmDialogComponent;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private checklistService: ChecklistService,
        private toastr: ToastrService,
    ) {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklist']) {
            this.checklist = changes['checklist'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
    }

    show(e: any) {
        this.popover.show(e);
        try {
            this.popover.align();
        }
        catch (e) { }
    }


    hide() {
        if (this.popover)
            this.popover.hide();
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.toastr.error('Nenhum celular cadastrado');
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    enviarMensagemCondicao(item: Aluno_CheckList_Item, aluno: Aluno) {
        this.mensagemWhatsapp.enviarMensagemCondicao(aluno, item.checklist_Item_Id);
    }

    checkboxMark(alunoChecklistItem: Aluno_CheckList_Item, model: NgModel) {
        this.alunoChecklistOnConfirmDialog.alunoChecklistItem = alunoChecklistItem;

        var checklists = this.checklistService.list.value;
        var item = checklists.flatMap(x => x.items).find(x => x.id == alunoChecklistItem.checklist_Item_Id) as Checklist_Item;
        this.alunoChecklistOnConfirmDialog.item = item;

        this.alunoChecklistOnConfirmDialog.show();

        var onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
            model.control.setValue(false);
            model.control.updateValueAndValidity();
            this.alunoChecklistOnConfirmDialog.hide();
            onCancel.unsubscribe();
        });

        var onFinish = this.alunoChecklistOnConfirmDialog.onFinish.subscribe(res => {

            alunoChecklistItem.observacoes = res.observacoes;
            alunoChecklistItem.dataFinalizacao = res.dataFinalizacao;
            alunoChecklistItem.account_Finalizacao_Id = res.account_Finalizacao_Id;
            alunoChecklistItem.account_Finalizacao = res.account_Finalizacao;

            onFinish.unsubscribe();
        });

    }


}

