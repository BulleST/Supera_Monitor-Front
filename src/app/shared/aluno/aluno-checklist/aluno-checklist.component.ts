import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno_CheckList_Item, Checklist } from '../../../models/checklist.model';
import { ChecklistService } from '../../../services/checklist.service';
import { Aluno } from '../../../models/alunos.model';
import { AlunoChecklistCompleto } from '../../../models/calendario.model';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { AlunoChecklistDialogComponent } from '../aluno-checklist-dialog/aluno-checklist-dialog.component';

@Component({
    selector: 'app-aluno-checklist',
    standalone: false,
    templateUrl: './aluno-checklist.component.html',
    styleUrl: './aluno-checklist.component.css',
})
export class AlunoChecklistComponent implements OnChanges, OnDestroy {
    @Input() aluno_Id!: number;
    @Input() aluno!: Aluno;
    @Input() showChecklist = false;

    textoChecklist = '';
    atrasado = false;
    subscription: Subscription[] = [];
    checklist?: AlunoChecklistCompleto;
    loading = false;
    visibleDialog = false;

    checklists: Checklist[] = [];
    loadingChecklist = false;

    @ViewChild('checklistDialog') checklistDialog!: AlunoChecklistDialogComponent;

    @Output() alunoChanged = new EventEmitter<Aluno>();

    constructor(
        private checklistService: ChecklistService,
    ) {

        var checklists = checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklists)

        if (!this.checklists.length) {
            this.loadingChecklist = true;
            lastValueFrom(this.checklistService.getList())
                .then(res => this.loadingChecklist = false)
                .catch(res => this.loadingChecklist = false);
        }

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno_Id']) {
            this.aluno_Id = changes['aluno_Id'].currentValue;
        }
        if (changes['showChecklist']) {
            this.showChecklist = changes['showChecklist'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            this.loadChecklist();
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async loadChecklist() {
        if(this.showChecklist) {
            
        this.loading = true;

        let alunoChecklist: Aluno_CheckList_Item[] = this.aluno.alunoChecklist;

        if (!this.aluno.alunoChecklist?.length && this.aluno_Id) {
            alunoChecklist = await lastValueFrom(this.checklistService.getChecklistAluno(this.aluno_Id))
        }

        this.aluno.alunoChecklist = alunoChecklist.map(checklistAluno => {
            checklistAluno.finalizado = !!checklistAluno.dataFinalizacao;
            return checklistAluno
        });

        this.aluno.checklistCompleto = this.checklists
            .map(checklist => {
                var checklistAluno = new AlunoChecklistCompleto;
                checklistAluno.id = checklist.id;
                checklistAluno.nome = checklist.nome;
                checklistAluno.items = alunoChecklist.filter(x => x.checklist_Id == checklist.id);
                checklistAluno.prazo = checklistAluno.items[0]?.prazo ?? undefined;
                checklistAluno.finalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                checklistAluno.atrasados = checklistAluno.items.filter((x: any) => !x.finalizado && moment(x.prazo).week() < moment(new Date).week());
                checklistAluno.pendentesDaSemana = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                return checklistAluno;
            });

        this.alunoChanged.emit(this.aluno);

        this.checklist = this.aluno.checklistCompleto.find(x => x.id == this.aluno.checklist_Id);

        var pendentesDaSemana = this.aluno.checklistCompleto.filter(x => x.pendentesDaSemana.length)
        var atrasados = this.aluno.checklistCompleto.filter(x => x.atrasados.length > 0);
        this.atrasado = atrasados.length > 0;

        if (atrasados.length > 0){
             this.textoChecklist = '90 dias vencidos com pendências';
        }
        if (atrasados.length == 0 && pendentesDaSemana.length == 0) {
            this.textoChecklist = '90 dias concluídos';
        }

        this.loading = false;
        }
    }

}
