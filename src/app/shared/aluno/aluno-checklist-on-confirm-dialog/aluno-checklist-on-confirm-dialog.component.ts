import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Aluno_CheckList_Item, Checklist_Item } from '../../../models/checklist.model';
import { AlunoChecklistCompleto } from '../../../models/calendario.model';
import { ChecklistService } from '../../../services/checklist.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import moment from 'moment';
import { showError } from '../../../utils';
import { NgModel } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { Aluno_Checklist_Item_View } from '../../../models/aluno-checklist-item-list.model';

@Component({
    selector: 'app-aluno-checklist-on-confirm-dialog',
    standalone: false,
    templateUrl: './aluno-checklist-on-confirm-dialog.component.html',
    styleUrl: './aluno-checklist-on-confirm-dialog.component.css',
    providers: [ConfirmationService]
})
export class AlunoChecklistOnConfirmDialogComponent implements OnChanges {

    visible = false;
    observacao = '';
    loading = false;

    @Input() alunoChecklistItem!: Aluno_CheckList_Item | Aluno_Checklist_Item_View;
    @Input() item!: Checklist_Item

    @Output() onCancel = new EventEmitter<boolean>();

    constructor(
        private service: ChecklistService,
        private toastr: ToastrService,
        private confirmationService: ConfirmationService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['alunoChecklistItem']) {
            this.alunoChecklistItem = changes['alunoChecklistItem'].currentValue;
        }
        if (changes['item']) {
            this.item = changes['item'].currentValue;
        }

    }

    show() {
        this.visible = true;
    }

    hide() {
        console.log('hide')
        this.visible = false;
    }

    onHide() {
        console.log('onHide')
        this.onCancel.emit(false);
    }

    showError(header: string, message: string, e: any, error: any) {
        showError(this.confirmationService, header, message, e, error.toString());
    }

    send(e: any) {
        this.loading = true;
        this.alunoChecklistItem.observacoes = this.observacao
        lastValueFrom(this.service.markAsDone( this.alunoChecklistItem.id,  this.alunoChecklistItem.observacoes))
            .then(res => {
                this.observacao = '';
                this.loading = false;
                this.toastr.success(`Checklist${this.item.nome} finalizado com sucesso!`);
                this.hide();

                this.service.onFinish.emit(this.alunoChecklistItem.id);
            })
            .catch(res => {
                this.showError('Erro', 'Não foi possível finalizar o checklist.', e, res)
                this.hide();
                this.onCancel.emit(true);
            });
    }

}
