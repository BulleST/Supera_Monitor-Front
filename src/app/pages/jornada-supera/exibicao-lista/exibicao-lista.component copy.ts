import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Checklist } from '../../../../models/checklist.model';
import { Aluno } from '../../../../models/alunos.model';
import { AlunoChecklistCompleto } from '../../../../models/calendario.model';
import { ChecklistPopoverComponent } from './checklist-popover/checklist-popover.component';
import { AlunoPopoverComponent } from '../../../../shared/aluno/aluno-popover/aluno-popover.component';
import { MensagemWhatsapp } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';

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

    // true - cards
    // false - lista
    @Input() modoExibicao: boolean = false;
    @Output() modoExibicaoOnChange = new EventEmitter<boolean>();
    @Output() toggleFilterPopover = new EventEmitter<any>();

    statusFilter = [
        { label: 'Todos', value: null },
        { label: 'Atrasado', value: 'Atrasado' },
        { label: 'Finalizado', value: 'Finalizado' },
        { label: 'Futuro', value: 'Futuro' },
        { label: 'Em Andamento', value: 'Em Andamento' },
        { label: 'Indefinido', value: 'Indefinido' },
    ]

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
        }
        if (changes['loadingAlunos']) {
            this.loading = changes['loadingAlunos'].currentValue;
        }
        if (changes['loadingChecklists']) {
            this.loadingChecklists = changes['loadingChecklists'].currentValue;
        }
        if (changes['alunos']) {
            this.alunos = changes['alunos'].currentValue;
        }
        if (changes['modoExibicao']) {
            this.modoExibicao = changes['modoExibicao'].currentValue;
        }
    }

    modoExibicaoChanged() {
        this.modoExibicaoOnChange.emit(this.modoExibicao);
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.toastr.error('Nenhum celular cadastrado');
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
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


    filtrarChecklistStatus(value: string | null, checklist_Id: number, table: Table, filterCallback: any) {
        let alunosFiltered = this.alunos.filter(aluno => {
            let checklist = aluno.checklistCompleto.find(x => x.id == checklist_Id) as AlunoChecklistCompleto;

            if (!value) {
                return true
            }
            if (checklist.status === value) {
                return true;
            }
            return false;
        });

        table.filteredValue = alunosFiltered;
    }

}
