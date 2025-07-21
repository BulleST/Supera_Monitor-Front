import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { Popover } from 'primeng/popover';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import moment from 'moment';
import { CalendarioUtils } from '../../../../utils';

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

    backgroundColor!: string;
    borderColor!: string;
    textColor!: string;

    constructor(
        private calendarioUtils: CalendarioUtils
    ) {

    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            if (this.evento.alunos) 
                this.alunosStr = this.evento.alunos.map(x => x.aluno.split(' ')[0]).join(', ')
        }
        if (changes['arg']) {
            this.arg = changes['arg'].currentValue;

        }
        if (this.evento && this.arg) {
            const styles = this.getEventStyles(this.evento);
            this.backgroundColor = styles.backgroundColor;
            this.borderColor = styles.borderColor;
            this.textColor = styles.textColor;

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

    getEventStyles(item: Evento): {
        backgroundColor: string
        textColor: string
        borderColor: string
    } {
        const MEETING_COLOR = '#F37435';
        const DEFAULT_COLOR = '#2E2E2E';

        let backgroundColor = DEFAULT_COLOR
        let borderColor = DEFAULT_COLOR
        let textColor = this.calendarioUtils.getTextColor(backgroundColor)

        switch (item.evento_Tipo_Id) {
            case EventoTipo.Reuniao:
                backgroundColor = MEETING_COLOR;
                borderColor = MEETING_COLOR;
                textColor = this.calendarioUtils.getTextColor(MEETING_COLOR);
                break;
            default:
                backgroundColor = item.corLegenda ?? DEFAULT_COLOR;
                borderColor = backgroundColor;
                textColor = this.calendarioUtils.getTextColor(backgroundColor);
                break;
        }


        return { backgroundColor, borderColor, textColor };
    }


}
