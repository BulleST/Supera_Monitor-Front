import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import moment from 'moment';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';

@Component({
    selector: 'app-evento-item',
    standalone: false,
    templateUrl: './evento-item.component.html',
    styleUrl: './evento-item.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoItemComponent implements OnChanges {
    @Input() evento!: Evento;
    @Input() arg!: any;
    @Output() selectEvent = new EventEmitter<any>;
    @Output() cdkDrop = new EventEmitter<any>;
    EventoTipo = EventoTipo;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
        }
        if (changes['arg']) {
            this.arg = changes['arg'].currentValue;
        }
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

    eventoClick(e: any) {
        this.selectEvent.emit(e)
    }

    async cdkDropListDropped(event: CdkDragDrop<Evento_Participacao_Aluno[]>) {
        this.cdkDrop.emit(event)
    }
}
