import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MensagemWhatsapp } from '../../../../utils';
import { JornadaSupera_Card_Checklist_Item_Aluno, JornadaSupera_Card_Checklist_Item, JornadaSupera_Card_Checklist } from './../../../../models/jornada-supera-cards.model';
import { JornadaSuperaStatus } from '../../../../models/jornada-supera-status.model';
import { DialogService } from 'primeng/dynamicdialog';
import { showAluno } from '../../../../utils/show-aluno';
import { AlunoService } from '../../../../services/alunos.service';
import { EventoService } from '../../../../services/evento.service';
import { finalizarChecklistCondicional } from '../../../../utils/show-finalizar-checklist';

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
        private alunoService: AlunoService,
        private eventoService: EventoService,
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

        finalizarChecklistCondicional({
            dialogService: this.dialogService,
            alunoService: this.alunoService,
            eventoService: this.eventoService,
            aluno_Id:  this.alunoChecklistItem.aluno_Id,
            checklist_Id: this.checklist.id,
            checklist_Item: this.item.nome,
            checklist_Item_Id: this.item.id,
            aluno_Checklist_Item_Id: this.alunoChecklistItem.id,
            prazo: this.alunoChecklistItem.prazo,
            finalizado: this.alunoChecklistItem.finalizado,
            status: this.alunoChecklistItem.status,
            aluno: this.alunoChecklistItem.aluno,
            celular: this.alunoChecklistItem.celular,
            corLegenda: this.alunoChecklistItem.corLegenda,
            turma: this.alunoChecklistItem.turma
        });
       
    }
    
    showAluno(aluno: JornadaSupera_Card_Checklist_Item_Aluno) {
        showAluno(this.dialogService, aluno.aluno_Id);
    }
}