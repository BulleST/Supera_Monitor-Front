import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CalendarioView } from '../../../../models/calendario.model';
import { EventoService } from '../../../../services/evento.service';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MobileService } from '../../../../utils';
import { ScreenWidth } from '../../../../utils/mobile';
import { Subscription } from 'rxjs';
import { Select, SelectChangeEvent } from 'primeng/select';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'app-toolbar',
    standalone: false,
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.css',
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

    agendarValue?: MenuItem;
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
            routerLink: 'calendario/primeira-aula/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Aula;
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
        private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        
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

    async agendarEvento(e: SelectChangeEvent, select: NgModel) {
        console.log(this.agendarValue, select);
        if (this.agendarValue) {
            if (this.agendarValue.command) {
                this.agendarValue.command(e);
            }
            var a = await this.router.navigateByUrl(this.agendarValue.routerLink);
            console.log(a);
            delete this.agendarValue;
            select.control.setValue(undefined)
            select.control.updateValueAndValidity();
            
            this.cdr.markForCheck(); // Marca para verificação na próxima detecção
            this.cdr.detectChanges()
        }
    }
}
