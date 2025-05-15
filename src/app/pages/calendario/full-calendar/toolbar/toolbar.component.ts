import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CalendarioRequest, CalendarioView } from '../../../../models/calendario.model';
import { EventoService } from '../../../../services/evento.service';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-toolbar',
    standalone: false,
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnChanges {
    @Input() currentTitle: string = '';
    @Output() update = new EventEmitter<boolean>();

    view: CalendarioView = CalendarioView.CalendarioGeral;
    viewMenu: MenuItem[] = [
        {
            label: 'Meu Calendário',
            value: CalendarioView.MeuCalendario,
            icon: 'pi pi-user',
        },
        {
            label: 'Calendário Geral',
            value: CalendarioView.CalendarioGeral,
            icon: 'pi pi-calendar',
        }
    ];

    agendarMenuItem: MenuItem[] = [
        {
            label: 'Aula 0',
            routerLink: 'calendario/aula-zero/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.AulaZero;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Turma Extra',
            routerLink: 'calendario/turma-extra/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.AulaExtra;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Superação',
            routerLink: 'calendario/superacao/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Superacao;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Oficina',
            routerLink: 'calendario/oficina/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Oficina;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Reunião',
            routerLink: 'calendario/reuniao/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Reuniao;
                this.service.setEvento(evento);
            }
        },
    ];

    constructor(
        private service: EventoService,
        private router: Router,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentTitle']) {
            this.currentTitle = changes['currentTitle'].currentValue;
        }

    }

    updateCalendar() {
        this.update.emit(true)
    }


    async calendarViewChanged() {
        this.service.calendarView.emit(this.view);
    }

    agendarEvento(item: MenuItem, e: any) {
        this.router.navigateByUrl(item.routerLink);
        if (item.command)
            item.command(e);
    }


}
