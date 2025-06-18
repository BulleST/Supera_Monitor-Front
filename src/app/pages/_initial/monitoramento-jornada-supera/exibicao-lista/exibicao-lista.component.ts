import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno_CheckList_Item, Checklist } from '../../../../models/checklist.model';
import { Aluno, alunosColumns } from '../../../../models/alunos.model';
import { AlunoService } from '../../../../services/alunos.service';
import { DisplayType, FilterType, MensagemWhatsapp } from '../../../../utils';
import { AlunoChecklistCompleto } from '../../../../models/calendario.model';
import { ChecklistPopoverComponent } from './checklist-popover/checklist-popover.component';
import { AlunoPopoverComponent } from '../../../../shared/aluno/aluno-popover/aluno-popover.component';

@Component({
    selector: 'app-exibicao-lista',
    standalone: false,
    templateUrl: './exibicao-lista.component.html',
    styleUrl: './exibicao-lista.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExibicaoListaComponent implements OnChanges {
    @Input() checklists!: Checklist[];
    @Input() loading: boolean = true;
    @Input() alunos: Aluno[] = [];


    @ViewChild('popoverChecklist') popoverChecklist!: ChecklistPopoverComponent;
    @ViewChild('alunoPopover') alunoPopover!: AlunoPopoverComponent;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }
        if (changes['alunos']) {
            this.alunos = changes['alunos'].currentValue;
        }
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

    enviarMensagemApresentacaoDiretorFranqueado( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(aluno.nome, aluno.celular);
    }

    enviarMensagemBoasVindas( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(aluno.nome, aluno.celular, aluno.email, aluno.diaSemana, aluno.horario, aluno.professor, aluno.linkGrupo);
    }

    enviarMensagemAdequacaoTurma( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(aluno.nome, aluno.celular);
    }

    enviarMensagemLembreteOficina( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(aluno.nome, aluno.celular);
    }

    enviarMensagemLembreteSuperacao( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(aluno.nome, aluno.celular);
    }

    enviarMensagemFeedbackPosVenda( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(aluno.nome, aluno.celular);
    }

    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda( aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.nome, aluno.celular);
    }


    showAlunoPopover(e: any, aluno: Aluno) {
        this.alunoPopover.aluno_Id = aluno.id;
        this.alunoPopover.aluno = aluno;
        this.alunoPopover.showChecklist = false;
        this.alunoPopover.show(e);
    }

    showChecklistPopover(e: any, aluno: Aluno, checklist: AlunoChecklistCompleto) {
        this.popoverChecklist.aluno = aluno;
        this.popoverChecklist.checklist = checklist;
        this.popoverChecklist.show(e);
    }

    hideChecklistPopover() {
        this.popoverChecklist.hide();
    }

    trackByChecklistId(index: number, item: Checklist) {
        return item.id;
    }

}
