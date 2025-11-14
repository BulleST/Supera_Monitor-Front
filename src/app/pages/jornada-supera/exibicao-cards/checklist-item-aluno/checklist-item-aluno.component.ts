import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MensagemWhatsapp } from '../../../../utils';
import { JornadaSupera_Card_Checklist_Item_Aluno, JornadaSupera_Card_Checklist_Item, JornadaSupera_Card_Checklist } from './../../../../models/jornada-supera-cards.model';
import { JornadaSuperaStatus } from '../../../../models/jornada-supera-status.model';
import { DialogService } from 'primeng/dynamicdialog';
import { FinalizarChecklistComponentView } from '../../../../shared/checklist/finalizar-checklist/finalizar-checklist.component';
import { showAluno } from '../../../../utils/show-aluno';
import { showFinalizarChecklist } from '../../../../utils/show-finalizar-checklist';

@Component({
    selector: 'app-checklist-item-aluno',
    standalone: false,
    templateUrl: './checklist-item-aluno.component.html',
    styleUrl: './checklist-item-aluno.component.css',
    providers: [DialogService]
})
export class ChecklistItemAlunoComponent implements OnChanges {

    @Input() alunoChecklistItem!: JornadaSupera_Card_Checklist_Item_Aluno;
    @Input() item!: JornadaSupera_Card_Checklist_Item;
    @Input() checklist!: JornadaSupera_Card_Checklist;

    icon: string = '';
    text: string = '';
    textColor: string = '';

    hide = false;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private dialogService: DialogService,
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
        if (changes['checklist']) {
            this.checklist = changes['checklist'].currentValue;
        }
    }

    setComponent() {
        if (this.alunoChecklistItem.status == JornadaSuperaStatus.Atrasado) {
            this.icon = 'pi pi-times-circle';
            this.textColor = 'text-red-500';
            this.text = 'Atrasado';
        }
        else if (this.alunoChecklistItem.status == JornadaSuperaStatus.EmAndamento) {
            this.icon = 'pi pi-hourglass';
            this.textColor = 'text-orange-500';
            this.text = 'Em Andamento';
        }
        else if (this.alunoChecklistItem.status == JornadaSuperaStatus.Finalizado) {
            this.icon = 'pi pi-check-circle';
            this.textColor = 'text-green-500';
            this.text = 'Finalizado';
        }
        else if (this.alunoChecklistItem.status == JornadaSuperaStatus.FinalizadoComAtraso) {
            this.icon = 'pi pi-check-circle';
            this.textColor = 'text-yellow-600';
            this.text = 'Finalizado';
        }
    }

    enviarMensagem() {
        if (this.alunoChecklistItem && this.alunoChecklistItem.celular) {
            let object = this.mensagemWhatsapp.enviarMensagem(this.alunoChecklistItem.aluno, this.alunoChecklistItem.celular)
            window.open(object.link, '_blank');
            this.mensagemWhatsapp.copiarMensagem(object.mensagem);
        }
    }

    finalizarChecklist() {

        var view: FinalizarChecklistComponentView = {
            alunoId: this.alunoChecklistItem.aluno_Id,
            alunoChecklistItemId: this.alunoChecklistItem.id,
            checklistItemId: this.item.id,
            checklistId: this.checklist.id,

            checklistItem: this.item.nome,
            aluno: this.alunoChecklistItem.aluno,
            turma: this.alunoChecklistItem.turma,
            corLegenda: this.alunoChecklistItem.corLegenda,
            prazo: this.alunoChecklistItem.prazo,
            status: this.alunoChecklistItem.status,
            celular: this.alunoChecklistItem.celular,
        }
        
        var ref = showFinalizarChecklist(this.dialogService, view);
       
    }
    
    showAluno(aluno: JornadaSupera_Card_Checklist_Item_Aluno) {
        showAluno(this.dialogService, aluno.aluno_Id);
    }
}