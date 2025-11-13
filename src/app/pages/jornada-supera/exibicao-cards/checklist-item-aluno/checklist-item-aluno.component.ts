import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MensagemWhatsapp } from '../../../../utils';
import { JornadaSupera_Card_Checklist_Item_Aluno, JornadaSupera_Card_Checklist_Item, JornadaSupera_Card_Checklist } from './../../../../models/jornada-supera-cards.model';
import { JornadaSuperaStatus } from '../../../../models/jornada-supera-status.model';
import { DialogService } from 'primeng/dynamicdialog';
import { FinalizarChecklistComponent, FinalizarChecklistComponentModel } from '../../../../shared/checklist/finalizar-checklist/finalizar-checklist.component';
import { JornadaSuperaService } from '../../../../services/jornada-supera.service';
import { showAluno } from '../../../../utils/show-aluno';

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
        private jornadaSuperaService: JornadaSuperaService,
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

        var view: FinalizarChecklistComponentModel = {
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
        var ref = this.dialogService.open(FinalizarChecklistComponent, {
            header: 'Finalizar Checklist',
            showHeader: false,
            closable: true,
            maximizable: false,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '95vw',
            style: {
                maxWidth: '500px',
            },
            data: {
                view: view
            }

        });
    }

    showAlunoChecklistOnConfirm() {
        // let aluno: Aluno = {
        //     id: this.alunoChecklistItem.aluno_Id,
        //     nome: this.alunoChecklistItem.aluno,
        //     celular: this.alunoChecklistItem.celular,
        //     diaSemana: this.alunoChecklistItem.diaSemana,
        //     corLegenda: this.alunoChecklistItem.corLegenda,
        //     turma: this.alunoChecklistItem.turma,
        //     turma_Id: this.alunoChecklistItem.turma_Id,
        //     professor: this.alunoChecklistItem.professor,
        //     professor_Id: this.alunoChecklistItem.professor_Id,
        //     email: this.alunoChecklistItem.email,
        //     linkGrupo: this.alunoChecklistItem.linkGrupo,
        //     horario: this.alunoChecklistItem.horario,
        // } as Aluno

        // this.alunoChecklistOnConfirmDialog.alunoChecklistItem = this.alunoChecklistItem;
        // this.alunoChecklistOnConfirmDialog.aluno = aluno;
        // this.alunoChecklistOnConfirmDialog.show(aluno);

        // let onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
        //     this.alunoChecklistOnConfirmDialog.hide();
        //     onCancel.unsubscribe();
        //     onFinish.unsubscribe();
        // });

        // let onFinish = this.alunoChecklistOnConfirmDialog.onFinish.subscribe(res => {

        //     this.alunoChecklistItem.observacoes = res.observacoes;
        //     this.alunoChecklistItem.dataFinalizacao = res.dataFinalizacao;
        //     this.alunoChecklistItem.account_Finalizacao_Id = res.account_Finalizacao_Id;
        //     this.alunoChecklistItem.account_Finalizacao = res.account_Finalizacao;
        //     this.hide = true;
        //     setTimeout(() => {
        //         this.alunoChecklistItem = undefined as any;
        //     }, 1000);
        //     onCancel.unsubscribe();
        //     onFinish.unsubscribe();
        // });

    }
    
    showAluno(aluno: JornadaSupera_Card_Checklist_Item_Aluno) {
        showAluno(aluno.aluno_Id, this.dialogService);
    }
}