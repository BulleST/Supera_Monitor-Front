import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlunoService } from '../../../../services/alunos.service';
import { lastValueFrom } from 'rxjs';
import { Aluno } from '../../../../models/alunos.model';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';

@Component({
    selector: 'app-faltas',
    standalone: false,

    templateUrl: './faltas.component.html',
    styleUrl: './faltas.component.css'
})
export class FaltasComponent implements OnChanges {
    @Input() object: Aluno = new Aluno;
    loading = false;
    list: any;

    constructor(private service: AlunoService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            this.update();
        }
    }

    update() {
        if (this.object.id) {
            this.loading = true;
            lastValueFrom(this.service.getResumo(this.object.id))
                .then(res => {
                    this.loading = false;
                    this.list = res;
                })
                .catch(res => {
                    this.loading = false;
                })
        }
    }

}


class Resumo {
    "turma_Id": number = 0;
    "presencas": Evento_Participacao_Aluno[] = [];
    "presencas_Count": number = 0;
    "faltas": Evento_Participacao_Aluno[] = [];
    "faltas_Count": number = 0;
    "reposicoes": Evento_Participacao_Aluno[] = [];
    "reposicoes_Count": number = 0;
    "aulas_Futuras": Evento_Participacao_Aluno[] = [];
    "aulas_Futuras_Count": number = 0;
}