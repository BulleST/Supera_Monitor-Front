import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import moment from 'moment';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { CalendarioDayView } from '../../../../models/calendario.model';
import { NameAbvPipe } from '../../../../utils/name.pipe';
import { NameFirstWordPipe } from '../../../../utils/name-first-word.pipe';

@Component({
    selector: 'app-evento-item',
    standalone: false,
    templateUrl: './evento-item.component.html',
    styleUrl: './evento-item.component.css'
})
export class EventoItemComponent implements OnChanges {
    @Input() evento!: Evento;
    @Input() arg!: any;
    @Input() calendarioDayView!: CalendarioDayView;
    @Output() selectEvent = new EventEmitter<any>;
    @Output() cdkDrop = new EventEmitter<any>;
    EventoTipo = EventoTipo;
    alunosStr = '';
    CalendarioDayView = CalendarioDayView;

    constructor(
        private nameFirstWordPipe: NameFirstWordPipe,
        private nameAbv: NameAbvPipe
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            if (this.evento.alunos) {
                this.alunosStr = this.evento.alunos.map(x => this.nameFirstWordPipe.transform(x.aluno)).join(', ');
            }
        }
        if (changes['arg']) {
            this.arg = changes['arg'].currentValue;
        }
        if (changes['calendarioDayView']) {
            this.calendarioDayView = changes['calendarioDayView'].currentValue;
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
