import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { lastValueFrom, Subscription } from 'rxjs';

import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import multiMonthPlugin from '@fullcalendar/multimonth';
import dayGridPlugin from '@fullcalendar/daygrid';

import listPlugin from '@fullcalendar/list';
import { Crypto, Header, MobileService } from '../../../utils';
import { FullCalendarComponent } from '@fullcalendar/angular';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextMenu } from 'primeng/contextmenu';
import { Feriado } from '../../../models/feriado.model';
import { EventoService } from '../../../services/evento.service';
import { PseudoEvento } from '../../../models/reposicao.model';
import { EventoTipo } from '../../../models/evento.model';
import { CalendarioUtils } from '../../../utils/calendario-utils';

@Component({
    selector: 'app-list',
    standalone: false,
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    providers: [ConfirmationService]
})
export class ListComponent implements OnDestroy, AfterViewInit {
    loading = true;
    subscription: Subscription[] = [];

    feriados: Feriado[] = [];
    loadingFeriados = false;
    EventoTipo = EventoTipo;

    currentTitle = '';
    calendarioList: Roteiro[] = [];

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    currentEvents = signal<EventApi[]>([]);
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            listPlugin,
            dayGridPlugin,
            multiMonthPlugin
        ],
        dayHeaders: true,
        weekends: true,
        hiddenDays: [0],
        height: '500px',
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        defaultAllDay: false,
        dayHeaderFormat: { weekday: 'long' },
        headerToolbar: { left: '', center: '', right: '' },
        nowIndicator: true,
        events: [],
        scrollTime: '08:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        weekNumbers: false,
        lazyFetching: true,
        datesSet: this.datesSet.bind(this),
        eventsSet: this.events.bind(this),
    }
    items: MenuItem[] = []
    constructor(
        private changeDetector: ChangeDetectorRef,
        private service: RoteiroService,
        private eventoService: EventoService,
        private mobileService: MobileService,
        private header: Header,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private calendarioUtils: CalendarioUtils,
    ) {

        var screen = this.mobileService.get().subscribe(res => {
            if (this.fullCalendar) {
                setTimeout(() => {
                    this.setCalendario();
                }, 200);
            }
        });
        this.subscription.push(screen);

        var open = this.header.menuAsideOpen.subscribe(res => {
            if (this.fullCalendar) {
                setTimeout(() => {
                    this.setCalendario();
                }, 200);
            }
        });
        this.subscription.push(open);

        var list = this.service.list.subscribe(res => {
            this.calendarioList = res;
            this.setCalendario();
        });
        this.subscription.push(list);



    }
    ngAfterViewInit(): void {
        this.update()
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async update() {
        this.loading = true;

        await this.loadFeriados();
        await this.loadCalendario();

    }

    async prev() {
        var anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().prev();
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    async next() {
        var anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().next();
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    async today() {
        var anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().today();
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    contextMenuShow(contexMenu: ContextMenu, item: Roteiro, e: any) {
        contexMenu.show(e);

        this.items = [{
            label: 'Menu',
            disabled: true,
            styleClass: 'text-500 font-bold opacity-100',
        },
        { separator: true },
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen text-orange-500',
            command: () => this.edit(item)
        },

        ];

    }
    setCalendario() {
        var calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();

        var events: any[] = [];
        this.feriados.forEach(item => {
            var event = {
                id: this.calendarioUtils.eventRandomId(),
                textColor: 'white',
                backgroundColor: 'red',
                borderColor: 'red',
                title: item.name,
                start: moment(item.date).toDate(),
                end: moment(item.date).toDate(),
                allDay: true,
                extendedProps: {
                    id: PseudoEvento.EventoId,
                    data: moment(item.date).toDate(),
                    descricao: item.name,
                    evento_Tipo_Id: EventoTipo.Feriado,
                    ...item,
                },
            }

            events.push(event)
        })
        this.calendarioList.filter(x => x.active == true)
            .forEach(x => {
                var event = {
                    id: this.calendarioUtils.eventRandomId(),
                    title: x.tema,
                    extendedProps: x,
                    start: x.dataInicio,
                    end: x.dataFim,
                    backgroundColor: x.corLegenda,
                    borderColor: x.corLegenda,
                    textColor: this.calendarioUtils.getTextColor(x.corLegenda ?? '#fff')
                };
                events.push(event);
            });


            
        this.fullCalendar.getApi().updateSize();
        this.calendarioOptions.events = events;
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

    async datesSet(arg: DatesSetArg) {
        this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);
        this.fullCalendar.getApi().updateSize();
        this.setCalendario();
    }

    edit(item: any) {
        var encrypted = this.crypto.encrypt(item.id);
        this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
    }


    async loadCalendario() {
        this.loading = true;
        lastValueFrom(this.service.getList())
            .then(res => {
                this.loading = false;
                this.calendarioList = res;
                this.setCalendario();
            }).catch(res => {
                this.loading = false;
            })
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        await lastValueFrom(this.eventoService.getFeriados(ano))
            .then(res => {
                res.forEach(item => {
                    var index = this.feriados.findIndex(x => moment(x.date).isSame(item.date))
                    if (index == -1) {
                        this.feriados.push(item);
                    }
                    else {
                        this.feriados.splice(index, 1, item)
                    }
                })
                this.loadingFeriados = false;
            })
            .catch(res => this.loadingFeriados = false);
    }
}
