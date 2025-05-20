import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Feriado } from '../../../../models/feriado.model';
import { Evento } from '../../../../models/evento.model';
import { Calendar } from '@fullcalendar/core';
import moment from 'moment';
import { PerfilCognitivo, PerfilCognitivo_Calculo_Data } from '../../../../models/perfil-cognitivo.model';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { lastValueFrom } from 'rxjs';
import { Popover } from 'primeng/popover';

@Component({
    selector: 'app-calculo-perfil-cognitivo',
    standalone: false,
    templateUrl: './calculo-perfil-cognitivo.component.html',
    styleUrl: './calculo-perfil-cognitivo.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculoPerfilCognitivoComponent implements OnChanges {
    @Input() eventos!: Evento[];
    @Input() data!: Date;
    @Input() feriados: Feriado[] = [];
    @Input() perfilCoginitivo: PerfilCognitivo[] = [];
    @Input() loadingPerfilCognitivo = false;
    calendar!: Calendar;

    @ViewChild('popover') popover!: Popover;

    model!: PerfilCognitivo_Calculo_Data;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['eventos']) this.eventos = changes['eventos'].currentValue;
        if (changes['data']) this.data = changes['data'].currentValue;
        if (changes['feriados']) this.feriados = changes['feriados'].currentValue;
        if (changes['perfilCoginitivo']) this.perfilCoginitivo = changes['perfilCoginitivo'].currentValue;
        if (changes['loadingPerfilCognitivo']) this.loadingPerfilCognitivo = changes['loadingPerfilCognitivo'].currentValue;
        this.calcula();
    }


    calcula() {
        if (this.data && this.eventos) {

            var dataPerfilCog: PerfilCognitivo_Calculo_Data = {
                data: this.data,
                perfilCognitivo: []
            };

            var dataFormated = moment(this.data).format('YYYY-MM-DD');
            var eventosData = this.eventos.filter(x => moment(x.data).format('YYYY-MM-DD') == dataFormated);
            var alunosData = eventosData.flatMap(x => x.alunos).filter(x => x.active);
            this.perfilCoginitivo.forEach(item => {
                var alunosPerfil = alunosData.filter(x => x.perfilCognitivo_Id == item.id);
                dataPerfilCog.perfilCognitivo.push({
                    id: item.id,
                    descricao: item.descricao,
                    nome: item.nome,
                    quantidadeAlunos: alunosPerfil.length
                });
            })

            this.model = dataPerfilCog;

        }
    }
    show(e: any) {
        this.popover.show(e)
    }

    hide() {
        this.popover.hide()
    }

}

