import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CalendarioRequest, CalendarioView } from '../../../../models/calendario.model';
import { EventoService } from '../../../../services/evento.service';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { Router } from '@angular/router';
import { MobileService } from '../../../../utils';
import { ScreenWidth } from '../../../../utils/mobile';
import { Subscription } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';

@Component({
    selector: 'app-toolbar',
    standalone: false,
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnChanges, OnDestroy {
    @Input() currentTitle: string = '';
    @Output() update = new EventEmitter<boolean>();
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth = ScreenWidth;
    subscription: Subscription[] = [];

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
        }, {
            label: 'Aula 1',
            routerLink: 'calendario/aula-1/agendar',
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
            label: 'Reposição',
            routerLink: 'calendario/reposicao/agendar',
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
        private mobileService: MobileService,
        private router: Router,
    ) {

        var screen = this.mobileService.get().subscribe(res => {
            this.screen = res;
            console.log(this.screen)
        });
        this.subscription.push(screen);

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentTitle']) {
            this.currentTitle = changes['currentTitle'].currentValue;
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    updateCalendar() {
        this.update.emit(true)
    }

    async calendarViewChanged() {
        this.service.calendarView.emit(this.view);
    }

    agendarEvento(e: SelectChangeEvent) {
        this.router.navigateByUrl(e.value.routerLink);
        if (e.value.command)
            e.value.command(e);
    }
}
