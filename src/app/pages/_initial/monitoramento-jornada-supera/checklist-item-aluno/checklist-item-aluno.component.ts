import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno_Checklist_Item_View } from '../../../../models/aluno-checklist-item-list.model';
import { MensagemWhatsapp } from '../../../../utils';
import { Aluno } from '../../../../models/alunos.model';
import { Checklist_Item } from '../../../../models/checklist.model';
import { AlunoChecklistOnConfirmDialogComponent } from '../../../../shared/aluno/aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
import { ChecklistService } from '../../../../services/checklist.service';

@Component({
    selector: 'app-checklist-item-aluno',
    standalone: false,
    templateUrl: './checklist-item-aluno.component.html',
    styleUrl: './checklist-item-aluno.component.css',
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChecklistItemAlunoComponent implements OnChanges {

    @Input() alunoChecklistItem!: Aluno_Checklist_Item_View;
    @Input() item!: Checklist_Item;

    @ViewChild('alunoChecklistOnConfirmDialog') alunoChecklistOnConfirmDialog!: AlunoChecklistOnConfirmDialogComponent
    icon: string = '';
    text: string = '';
    textColor: string = '';

    hide = false;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['alunoChecklistItem']) {
            this.alunoChecklistItem = changes['alunoChecklistItem'].currentValue;
            this.setComponent();

        }
        if (changes['item']) {
            this.item = changes['item'].currentValue;
        }
    }

    setComponent() {
        if (this.alunoChecklistItem.status == 'Atrasado') {
            this.icon = 'pi pi-times-circle';
            this.textColor = 'text-red-500';
            this.text = 'Atrasado';
        }
        else if (this.alunoChecklistItem.status == 'Pendente') {
            this.icon = 'pi pi-hourglass';
            this.textColor = 'text-orange-500';
            this.text = 'Em Andamento';
        }
        else if (this.alunoChecklistItem.status == 'Finalizado') {
            this.icon = 'pi pi-check-circle';
            this.textColor = 'text-green-500';
            this.text = 'Finalizado';
        }
    }

    enviarMensagem() {
        if (this.alunoChecklistItem) {
            let object = this.mensagemWhatsapp.enviarMensagem(this.alunoChecklistItem.aluno, this.alunoChecklistItem.celular)
            window.open(object.link, '_blank');
            this.mensagemWhatsapp.copiarMensagem(object.mensagem);
        }
    }


    showAlunoChecklistOnConfirm() {
        let aluno: Aluno = {
            id: this.alunoChecklistItem.aluno_Id,
            nome: this.alunoChecklistItem.aluno,
            celular: this.alunoChecklistItem.celular,
            diaSemana: this.alunoChecklistItem.diaSemana,
            corLegenda: this.alunoChecklistItem.corLegenda,
            turma: this.alunoChecklistItem.turma,
            turma_Id: this.alunoChecklistItem.turma_Id,
            professor: this.alunoChecklistItem.professor,
            professor_Id: this.alunoChecklistItem.professor_Id,
            email: this.alunoChecklistItem.email,
            linkGrupo: this.alunoChecklistItem.linkGrupo,
            horario: this.alunoChecklistItem.horario,
        } as Aluno

        this.alunoChecklistOnConfirmDialog.alunoChecklistItem = this.alunoChecklistItem;
        this.alunoChecklistOnConfirmDialog.aluno = aluno;
        this.alunoChecklistOnConfirmDialog.show(aluno);
        
        var onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
            this.alunoChecklistOnConfirmDialog.hide();
            onCancel.unsubscribe();
        });

        var onFinish = this.alunoChecklistOnConfirmDialog.onFinish.subscribe(res => {
            console.log('onFinish')
            this.alunoChecklistItem.observacoes = res.observacoes;
            this.alunoChecklistItem.dataFinalizacao = res.dataFinalizacao;
            this.alunoChecklistItem.account_Finalizacao_Id = res.account_Finalizacao_Id;
            this.alunoChecklistItem.account_Finalizacao = res.account_Finalizacao;
            this.hide = true;
            setTimeout(() => {
                this.alunoChecklistItem = undefined as any;
            }, 1000);
            onFinish.unsubscribe();
        });
        
    }
}