import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Checklist } from '../../../../models/checklist.model';
import { Aluno } from '../../../../models/alunos.model';
import { AlunoChecklistCompleto } from '../../../../models/calendario.model';
import { ChecklistPopoverComponent } from './checklist-popover/checklist-popover.component';
import { AlunoPopoverComponent } from '../../../../shared/aluno/aluno-popover/aluno-popover.component';
import { MensagemWhatsapp } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-exibicao-lista',
    standalone: false,
    templateUrl: './exibicao-lista.component.html',
    styleUrl: './exibicao-lista.component.css'
})
export class ExibicaoListaComponent implements OnChanges {
    @Input() checklists!: Checklist[];
    @Input() loading: boolean = true;
    @Input() loadingChecklists: boolean = true;
    @Input() alunos!: Aluno[];


    @ViewChild('popoverChecklist') popoverChecklist!: ChecklistPopoverComponent;
    @ViewChild('alunoPopover') alunoPopover!: AlunoPopoverComponent;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
            console.log('exibicao-list checklists', this.checklists)
        }
        if (changes['loadingAlunos']) {
            this.loading = changes['loadingAlunos'].currentValue;
            console.log('exibicao-list loadingAlunos', this.loading)
        }
        if (changes['loadingChecklists']) {
            this.loadingChecklists = changes['loadingChecklists'].currentValue;
            console.log('exibicao-list loadingChecklists', this.loadingChecklists)
        }
        if (changes['alunos']) {
            this.alunos = changes['alunos'].currentValue;
            console.log('exibicao-list alunos', this.alunos)
        }
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.toastr.error('Nenhum celular cadastrado');
            return;
        }
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
        this.popoverChecklist.show(e, aluno, checklist);
    }

    hideChecklistPopover() {
        this.popoverChecklist.hide();
    }

    trackByChecklistId(index: number, item: Checklist) {
        return item.id;
    }

}
