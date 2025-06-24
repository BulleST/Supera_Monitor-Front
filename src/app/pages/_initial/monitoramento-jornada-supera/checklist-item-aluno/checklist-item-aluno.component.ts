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
    urlEnviarMensagem = '';

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private checklistService: ChecklistService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['alunoChecklistItem']) {
            this.alunoChecklistItem = changes['alunoChecklistItem'].currentValue;
            this.setComponent();
            this.urlEnviarMensagem = this.enviarMensagemCondicao(this.alunoChecklistItem);
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

    enviarMensagemAluno(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    enviarMensagemCondicao(aluno: Aluno_Checklist_Item_View) {
        if (aluno.celular) {
            // Apresentação do Diretor Franqueado 
            if (aluno.checklist_Item_Id == 8) {
                return this.enviarMensagemApresentacaoDiretorFranqueado(aluno);
                // Confirmação da adequação do aluno ao perfil da turma 
            } else if (aluno.checklist_Item_Id == 9) {
                return this.enviarMensagemAdequacaoTurma(aluno);
                // Agendar 1ª Oficina 
            } else if (aluno.checklist_Item_Id == 12) {
                return this.enviarMensagemLembreteOficina(aluno);
                // Feedback pós venda 
            } else if (aluno.checklist_Item_Id == 13) {
                return this.enviarMensagemFeedbackPosVenda(aluno);
                // Confirmação de preeechimento do feedback pós venda 
            } else if (aluno.checklist_Item_Id == 32) {
                return this.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno);
                // Mensagem de boas-vindas 
            } else if (aluno.checklist_Item_Id == 37) {
                return this.enviarMensagemBoasVindas(aluno);
                // Agendar Superação 
            } else if (aluno.checklist_Item_Id == 22) {
                return this.enviarMensagemLembreteSuperacao(aluno);
                // Agendar 2ª Superação 
            } else if (aluno.checklist_Item_Id == 29) {
                return this.enviarMensagemLembreteSuperacao(aluno);
                // Agendar 2ª Oficina 
            } else if (aluno.checklist_Item_Id == 23) {
                return this.enviarMensagemLembreteOficina(aluno);
            } else {
                return this.enviarMensagem(aluno);
            }

        }
        return '';
    }

    enviarMensagem(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular);
    }

    enviarMensagemApresentacaoDiretorFranqueado(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(aluno.aluno, aluno.celular);
    }

    enviarMensagemBoasVindas(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(aluno.aluno, aluno.celular, aluno.email, aluno.diaSemana, aluno.horario, aluno.professor, aluno.linkGrupo);
    }

    enviarMensagemAdequacaoTurma(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(aluno.aluno, aluno.celular);
    }

    enviarMensagemLembreteOficina(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(aluno.aluno, aluno.celular);
    }

    enviarMensagemLembreteSuperacao(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(aluno.aluno, aluno.celular);
    }

    enviarMensagemFeedbackPosVenda(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(aluno.aluno, aluno.celular);
    }

    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno: Aluno_Checklist_Item_View) {
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.aluno, aluno.celular);
    }

    showAlunoChecklistOnConfirm() {
        this.alunoChecklistOnConfirmDialog.show();
        
        var onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
            this.alunoChecklistOnConfirmDialog.hide();
            onCancel.unsubscribe();
        });

        var onFinish = this.alunoChecklistOnConfirmDialog.onFinish.subscribe(res => {
            this.alunoChecklistItem.observacoes = res.observacoes;
            this.alunoChecklistItem.dataFinalizacao = res.dataFinalizacao;
            this.alunoChecklistItem.account_Finalizacao_Id = res.account_Finalizacao_Id;
            this.alunoChecklistItem.account_Finalizacao = res.account_Finalizacao;
            onFinish.unsubscribe();
        });
        
    }
}