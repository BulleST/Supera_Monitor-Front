import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Aluno_Historico } from '../../../../models/aluno-historico.model';
import moment from 'moment';
import 'moment/locale/pt-br'
import { Aluno } from '../../../../models/alunos.model';
import { lastValueFrom } from 'rxjs';
import { AlunoService } from '../../../../services/alunos.service';
import { FilterMatchMode } from 'primeng/api';

@Component({
    selector: 'app-historico',
    standalone: false,
    templateUrl: './historico.component.html',
    styleUrl: './historico.component.css'
})
export class HistoricoComponent implements OnChanges {

    @Input() object: Aluno = new Aluno;
    @Input() aluno_Id!: number;
    @Output() atualizar = new EventEmitter<boolean>();
    loading = false;
    FilterMathMode = FilterMatchMode
    list: Aluno_Historico[] = [];


    constructor(
        private service: AlunoService
    ) {
        this.atualizar.subscribe(res => this.update())
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno_Id']) {
            this.aluno_Id = changes['aluno_Id'].currentValue;
            this.update();
        }
        if (changes['object']) {
            this.object = changes['object'].currentValue;
        }
    }

    update() {
        if (this.aluno_Id) {
            this.list = []
            this.loading = true;
            lastValueFrom(this.service.getHistorico(this.aluno_Id))
                .then(res => {
                    this.loading = false;
                    this.list = res;
                })
                .catch(res => {
                    this.loading = false;
                    this.list = []
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
