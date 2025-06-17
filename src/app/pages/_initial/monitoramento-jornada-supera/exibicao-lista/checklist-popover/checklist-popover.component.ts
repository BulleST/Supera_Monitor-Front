import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { Subscription } from 'rxjs';
import { MensagemWhatsapp } from '../../../../../utils';
import { Aluno } from '../../../../../models/alunos.model';
import { AlunoChecklistCompleto } from '../../../../../models/calendario.model';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AlunoChecklistOnConfirmDialogComponent } from '../../../../../shared/aluno/aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
import { NgModel } from '@angular/forms';

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

    enviarMensagemAluno(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    enviarMensagemCondicao(item: Aluno_CheckList_Item, aluno: Aluno) {
        // Apresentação do Diretor Franqueado 
        if (item.checklist_Item_Id == 8) {
            return this.enviarMensagemApresentacaoDiretorFranqueado(aluno);
            // Confirmação da adequação do aluno ao perfil da turma 
        } else if (item.checklist_Item_Id == 9) {
            return this.enviarMensagemAdequacaoTurma(aluno);
            // Agendar 1ª Oficina 
        } else if (item.checklist_Item_Id == 12) {
            return this.enviarMensagemLembreteOficina(aluno);
            // Feedback pós venda 
        } else if (item.checklist_Item_Id == 13) {
            return this.enviarMensagemFeedbackPosVenda(aluno);
            // Confirmação de preeechimento do feedback pós venda 
        } else if (item.checklist_Item_Id == 32) {
            return this.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno);
            // Mensagem de boas-vindas 
        } else if (item.checklist_Item_Id == 37) {
            return this.enviarMensagemBoasVindas(aluno);
            // Agendar Superação 
        } else if (item.checklist_Item_Id == 22) {
            return this.enviarMensagemLembreteSuperacao(aluno);
            // Agendar 2ª Superação 
        } else if (item.checklist_Item_Id == 29) {
            return this.enviarMensagemLembreteSuperacao(aluno);
            // Agendar 2ª Oficina 
        } else if (item.checklist_Item_Id == 23) {
            return this.enviarMensagemLembreteOficina(aluno);
        } else {
            return this.enviarMensagem(aluno);
        }
    }

    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    enviarMensagemApresentacaoDiretorFranqueado(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(aluno.nome, aluno.celular);
    }

    enviarMensagemBoasVindas(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(aluno.nome, aluno.celular, aluno.email, aluno.diaSemana, aluno.horario, aluno.professor, aluno.linkGrupo);
    }

    enviarMensagemAdequacaoTurma(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(aluno.nome, aluno.celular);
    }

    enviarMensagemLembreteOficina(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(aluno.nome, aluno.celular);
    }

    enviarMensagemLembreteSuperacao(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(aluno.nome, aluno.celular);
    }

    enviarMensagemFeedbackPosVenda(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(aluno.nome, aluno.celular);
    }

    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.nome, aluno.celular);
    }


    onHide() {

    }

    checkboxMark(item: Aluno_CheckList_Item, model: NgModel) {
        this.alunoChecklistOnConfirmDialog.alunoChecklistItem = item;
        this.alunoChecklistOnConfirmDialog.show();

        var onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
            model.control.setValue(false);
            model.control.updateValueAndValidity();
            this.alunoChecklistOnConfirmDialog.hide()
            onCancel.unsubscribe();
        });


        // this.subscription.push(onCancel)
    }


}

