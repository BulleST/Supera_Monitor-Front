import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Aluno_Historico } from '../../../../models/aluno-historico.model';
import moment from 'moment';
import 'moment/locale/pt-br'
import { Aluno } from '../../../../models/alunos.model';
import { lastValueFrom } from 'rxjs';
import { AlunoService } from '../../../../services/alunos.service';

@Component({
    selector: 'app-historico',
    standalone: false,
    templateUrl: './historico.component.html',
    styleUrl: './historico.component.css'
})
export class HistoricoComponent implements OnChanges {

    @Input() object: Aluno = new Aluno;
    loading = false;
    list: Aluno_Historico[] = [
        {
            id: 0,
            aluno_Id: 0,
            data: new Date(2025, 2, 28, 10, 30),
            account_Created: 'Letícia',
            descricao: 'Transferencia de turma: O aluno foi transferido da turma A para turma B',
        },
        {
            id: 0,
            aluno_Id: 0,
            data: new Date(2025, 2, 27, 15, 30),
            account_Created: 'Letícia',
            descricao: 'Reposição agendada: O aluno agendou reposição do dia 25/03/25 para o dia 28/03/25 com a turma ABC',
        },
        {
            id: 0,
            aluno_Id: 0,
            data: new Date(2025, 2, 25, 15, 30),
            account_Created: 'Letícia',
            descricao: 'Superação agendada: O aluno agendou superação  para o dia 28/03/25 com o professor João',
        },
        {
            id: 0,
            aluno_Id: 0,
            data: new Date(2025, 2, 4, 15, 30),
            account_Created: 'Letícia',
            descricao: 'Inscrição Oficina: O aluno se inscreveu na oficina "Pessoas legais" no dia 25/03/25',
        },
        {
            id: 0,
            aluno_Id: 0,
            data: new Date(2024, 2, 4, 15, 30),
            account_Created: 'Letícia',
            descricao: 'Inscrição Oficina: O aluno se inscreveu na oficina "Pessoas legais" no dia 25/03/25',
        },
        {
            id: 0,
            aluno_Id: 0,
            data: new Date(2025, 0, 4, 15, 30),
            account_Created: 'Letícia',
            descricao: 'Inscrição Oficina: O aluno se inscreveu na oficina "Pessoas legais" no dia 25/03/25',
        },
    ]


    constructor(
        private service: AlunoService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            this.update();
        }
    }

    update() {
        if (this.object.id) {
            this.loading = true;
            lastValueFrom(this.service.getHistorico(this.object.id))
            .then(res => {
                this.loading = false;
                this.list = res;
            })
            .catch(res => {
                this.loading = false;
            })
        }
    }


    getFormating(date: Date) {
        moment.locale('pt');
        var msg = ''
        if (moment(date).isSame(new Date, 'date')) {
            msg = 'Hoje às ' + moment(date).format('HH[h]mm')
        }
        else if (moment(date).isSame(moment(new Date).subtract(1, 'day'))) {
            msg = 'Ontem às ' + moment(date).format('HH[h]mm')
        }
        else if (moment(date).week() == moment(new Date).week()) {
            msg = moment(date).format('dddd [às] HH[h]mm')
        }
        else if (moment(date).month() == moment(new Date).month() && moment(date).year() == moment(new Date).year()) {
            msg = moment(date).format('[dia] DD [às] HH[h]mm')
        }
        else if (moment(date).year() == moment(new Date).year()) {
            msg = moment(date).format('DD/MM [às] HH[h]mm')
        }
        else {
            msg = moment(date).format('DD/MM/YYYY [às] HH[h]mm')
        }

        return msg[0].toUpperCase() + msg.substring(1)
    }

}
