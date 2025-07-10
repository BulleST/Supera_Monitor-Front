import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { Popover } from 'primeng/popover';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import moment from 'moment';

@Component({
    selector: 'app-evento-item-hover',
    standalone: false,
    templateUrl: './evento-item-hover.component.html',
    styleUrl: './evento-item-hover.component.css'
})
export class EventoItemHoverComponent implements OnChanges {
    @Input() evento!: Evento;
    @Input() arg!: any;
    EventoTipo = EventoTipo;
    alunosStr = '';
    @ViewChild('popover') popover!: Popover;

    constructor() {

    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            if (this.evento.alunos) this.alunosStr = this.evento.alunos.map(x => x.aluno.split(' ')[0]).join(', ')
        }
        if (changes['arg']) {
            this.arg = changes['arg'].currentValue;
        }
    }

    show(e: any) {
        this.popover.show(e);
    }

    hide() {
        this.popover.hide();
    }

    setHorario(data: Date) {
        data = moment(data).toDate();
        if (data.getMinutes() == 0)
            return data.getHours() + 'h';
        else
            return moment(data).format('HH:mm');
    }


    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        if (!perfilCognitivo || perfilCognitivo.length == 0)
            return '';
        return perfilCognitivo.map(x => x.nome).join(', ');
    }


}
