import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { TurmaService } from '../../services/turma.service';
import { ProfessorService } from '../../services/professor.service';
import { Turma } from '../../models/turma.model';
import { Professor } from '../../models/professor.model';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-legend-color',
  standalone: false,
  templateUrl: './legend-color.component.html',
  styleUrl: './legend-color.component.css'
})
export class LegendColorComponent implements OnChanges, OnDestroy {

    @Input() corLegenda?: string = '';
    @Input() professor_Id?: number;
    @Input() professor?: string = '';
    @Input() turma?: string = '';
    @Input() turma_Id?: number;

    turmas: Turma[] = [];
    loadingTurmas = false;
    professores: Professor[] = [];
    loadingProfessores = false;
    subscription: Subscription[] = [];
    

    constructor(
        private turmaService: TurmaService,
        private professorService: ProfessorService,
    ) {
        let professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['corLegenda']) this.corLegenda = changes['corLegenda'].currentValue;
        if (changes['professor_Id']) this.professor_Id = changes['professor_Id'].currentValue;
        if (changes['professor']) this.professor = changes['professor'].currentValue;
        if (changes['turma']) this.turma = changes['turma'].currentValue;
        if (changes['turma_Id']) this.turma_Id = changes['turma_Id'].currentValue;
        this.setLegenda();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async setLegenda() {
        if (!this.corLegenda) {

            if (this.professor_Id) {
                let professor = await lastValueFrom(this.professorService.get(this.professor_Id));
                this.corLegenda = professor.corLegenda;
                this.professor = professor.nome;
            }
            else if (this.turma_Id) {
                let turma = await lastValueFrom(this.turmaService.get(this.turma_Id));
                this.corLegenda = turma.corLegenda;
                this.professor = turma.professor;
                this.turma = turma.nome;
            }


        }
    }

}
