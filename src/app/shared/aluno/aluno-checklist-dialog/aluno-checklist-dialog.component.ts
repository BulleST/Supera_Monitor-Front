import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno } from '../../../models/alunos.model';
import { Aluno_CheckList_Item } from '../../../models/checklist.model';
import { AlunoChecklistCompleto } from '../../../models/calendario.model';
import $ from 'jquery';
import { AlunoChecklistOnConfirmDialogComponent } from '../aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';

@Component({
    selector: 'app-aluno-checklist-dialog',
    standalone: false,
    templateUrl: './aluno-checklist-dialog.component.html',
    styleUrl: './aluno-checklist-dialog.component.css',
})
export class AlunoChecklistDialogComponent implements OnChanges, OnDestroy {

    @Input() aluno: Aluno = new Aluno;
    @Input() loading = false;
    @Output() onChecklistMark = new EventEmitter<any>();

    visible = false;
    scrollLeft: number = 0;

    selectedAlunoChecklistItem?: Aluno_CheckList_Item;
    @ViewChild('alunoChecklistOnConfirmDialog') alunoChecklistOnConfirmDialog!: AlunoChecklistOnConfirmDialogComponent;

    constructor(
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
        if (changes['loading']) this.loading = changes['loading'].currentValue;

    }

    ngOnDestroy(): void {

    }

    visibleChanged() {
        if (this.visible) {
            var tab = $(`p-tab[ng-reflect-value="${this.aluno.checklist_Id ?? 1}"]`).last()
            this.scrollLeft = $(tab).offset()?.left ?? 0
            $('.p-tablist-viewport').animate({
                scrollLeft: this.scrollLeft
            }, 300)
        }
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    checkboxMark(item: Aluno_CheckList_Item) {
        this.selectedAlunoChecklistItem = item;
        this.alunoChecklistOnConfirmDialog.alunoChecklistItem = item;
        this.alunoChecklistOnConfirmDialog.show();
    }

    onFailure(item: AlunoChecklistCompleto) {

    }

}
