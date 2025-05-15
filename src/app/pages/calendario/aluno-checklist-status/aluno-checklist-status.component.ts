import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { CalendarioAlunoChecklistView } from '../../../models/calendario.model';
import { Checklist } from '../../../models/checklist.model';

@Component({
    selector: 'app-aluno-checklist-status',
    standalone: false,
    templateUrl: './aluno-checklist-status.component.html',
    styleUrl: './aluno-checklist-status.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlunoChecklistStatusComponent implements OnChanges {
    @Input() aluno: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
    @Input() loading = false;
    checklist!: CalendarioAlunoChecklistView;

    atrasado = false;


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;

            if (this.aluno.checklist_Id) 
                this.checklist = this.aluno.checklistCompleto.find(x => x.id == this.aluno.checklist_Id) as CalendarioAlunoChecklistView; 
            else if(this.aluno.checklistCompleto.length > 0){
                this.checklist = this.aluno.checklistCompleto[this.aluno.checklistCompleto.length-1]
            }

            if (this.aluno.checklistCompleto && this.aluno.checklistCompleto.length) {
                var atrasados = this.aluno.checklistCompleto.filter(x => x.atrasados.length > 0);
                this.atrasado = atrasados.length > 0;
            }
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }


    }

}
