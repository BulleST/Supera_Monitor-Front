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

    enviarMensagem(aluno: Aluno) {
        var object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
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
