import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';

@Component({
  selector: 'app-aluno-checklist-status',
  standalone: false,
  templateUrl: './aluno-checklist-status.component.html',
  styleUrl: './aluno-checklist-status.component.css'
})
export class AlunoChecklistStatusComponent implements OnChanges {
    @Input() aluno: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
    @Input() loading = false;

    atrasado = false;


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            if (this.aluno.checklistCompleto && this.aluno.checklistCompleto.length) {
                var atrasados = this.aluno.checklistCompleto.filter(x => x.atrasados.length > 0);
                this.atrasado = atrasados.length > 0;
            }
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }


    }

    getChecklist(id?: number, aluno?: Evento_Participacao_Aluno) {
        if (id && aluno && aluno.checklistCompleto)
            return aluno.checklistCompleto.find(x => x.id == id)
        return undefined
    }
    
}
