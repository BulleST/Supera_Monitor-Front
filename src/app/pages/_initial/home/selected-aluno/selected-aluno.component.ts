import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarioAlunoList, CalendarioList } from '../../../../models/calendario.model';
import moment from 'moment';
import { ReposicaoAluno } from '../../../../models/reposicao.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../../../../utils';
import { AulaService } from '../../../../services/aulas.service';
import { Checklist, Checklist_Item, checklists } from '../../../../models/checklist.model';

@Component({
    selector: 'app-selected-aluno',
    standalone: false,

    templateUrl: './selected-aluno.component.html',
    styleUrl: './selected-aluno.component.css'
})
export class SelectedAlunoComponent implements OnChanges {
    visible = false;
    itemChecklists: Checklist_Item[] = [];

    checklists: Checklist[] = checklists;
    currentIndex = 0;
    currentChecklist: Checklist = checklists[0];
    prevChecklist?: Checklist = undefined;
    nextChecklist?: Checklist = checklists[1];

    @Input() selectedAluno?: CalendarioAlunoList;
    @Input() selectedAula?: CalendarioList;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: AulaService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedAula']) {
            this.selectedAula = changes['selectedAula'].currentValue;
        }
        if (changes['selectedAluno']) {
            this.selectedAluno = changes['selectedAluno'].currentValue;
        }

        if (this.selectedAluno && this.selectedAula) {
            this.visible = true;
        } else {
            this.visible = false;
        }

        this.itemChecklists = checklists.find(x => x.nome == '1ª Semana')?.items as Checklist_Item[];
    }

    hideAluno() {
        if (!this.visible) {
            this.selectedAluno = undefined;
            this.visible = false
        }
    }

    prev() {
        if (this.currentIndex == 0) {
            this.prevChecklist = undefined;
            this.nextChecklist = checklists[this.currentIndex+1];
            return;
        }
        this.currentIndex -= 1;
        this.currentChecklist = checklists[this.currentIndex];
        this.prevChecklist = checklists[this.currentIndex-1];
        this.nextChecklist = checklists[this.currentIndex+1];


    }
    
    next() {
        if (this.currentIndex == (this.checklists.length-1)) {
            this.prevChecklist = checklists[this.currentIndex-1];
            this.nextChecklist = undefined;
            return
        }
        this.currentIndex += 1;
        this.currentChecklist = checklists[this.currentIndex];
        this.prevChecklist = checklists[this.currentIndex-1];
        this.nextChecklist = checklists[this.currentIndex+1];
    }




    goToAluno(aluno: CalendarioAlunoList) {
        this.router.navigate(['aluno', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute });
    }

    
    goToReposicao(aluno: CalendarioAlunoList) {
        if (this.selectedAula) {
            var reposicao: ReposicaoAluno = {
                aluno: aluno.aluno,
                aluno_Id: aluno.aluno_Id,
                aluno_PerfilCognitivo: aluno.perfilCognitivo,
                aluno_PerfilCognitivo_Id: aluno.perfilCognitivo_Id,
                source_Sala_Id: this.selectedAula.sala_Id,
                source_Aula_Id: this.selectedAula.aula_Id,
                source_Data: this.selectedAula.data,
                source_Turma_Id: aluno.turma_Id,
                source_Turma: aluno.turma,
                source_Professor_Id: this.selectedAula.professor_Id,
                source_Professor: this.selectedAula.professor
            };
            this.service.reposicao.next(reposicao);

            reposicao.source_Data = moment(this.selectedAula.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
            this.router.navigate(['reposicao', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute, queryParams: reposicao })
        }
    }
}
