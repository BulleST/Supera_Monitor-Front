import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { lastValueFrom, Subscription } from 'rxjs';

import { CalendarOptions, DatesSetArg, EventApi, EventHoveringArg } from '@fullcalendar/core';
import multiMonthPlugin from '@fullcalendar/multimonth';
import dayGridPlugin from '@fullcalendar/daygrid';

import listPlugin from '@fullcalendar/list';
import { Crypto, Header, MobileService } from '../../../utils';
import { FullCalendarComponent } from '@fullcalendar/angular';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { Feriado } from '../../../models/feriado.model';
import { EventoTipo } from '../../../models/evento.model';
import { CalendarioUtils } from '../../../utils/calendario-utils';
import { ScreenWidth } from '../../../utils/mobile';
import { FeriadoService } from '../../../services/feriado.service';
import { PseudoEvento } from '../../../models/reposicao.model';

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
    list: Roteiro[] = [];

    items: MenuItem[] = [];

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    currentEvents = signal<EventApi[]>([]);
    calendarioOptions: CalendarOptions = {
        initialView: 'multiMonthYear',
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
        height: '100%',
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        fixedWeekCount: false,
        defaultAllDay: true,
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
        multiMonthMaxColumns: 2,
        dayMaxEvents: 2,
        dayMaxEventRows: false,
        allDaySlot: true,
        datesSet: this.datesSet.bind(this),
        eventsSet: this.events.bind(this),
        eventMouseEnter: this.eventMouseEnter.bind(this),
        eventMouseLeave: this.eventMouseLeave.bind(this),
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private roteiroService: RoteiroService,
        private feriadoService: FeriadoService,
        private mobileService: MobileService,
        private header: Header,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private calendarioUtils: CalendarioUtils,
    ) {

        let screen = this.mobileService.get().subscribe(res => {
            this.calendarioOptions.multiMonthMaxColumns = [ScreenWidth.xl, ScreenWidth.lg, ScreenWidth.md].includes(res) ? 2 : 1
            if (this.fullCalendar) {
                setTimeout(() => {
                    this.setCalendario();
                }, 200);
            }
        });
        this.subscription.push(screen);

        let open = this.header.menuAsideOpen.subscribe(res => {
            if (this.fullCalendar) {
                setTimeout(() => {
                    this.setCalendario();
                }, 200);
            }
        });
        this.subscription.push(open);

        let list = this.roteiroService.list.subscribe(res => {
            this.list = res;
            this.setCalendario();
        });
        this.subscription.push(list);

        let feriados = this.feriadoService.list.subscribe(res => {
            this.feriados = res;
            this.setCalendario();
        });
        this.subscription.push(feriados);



    }
    ngAfterViewInit(): void {
        this.update()
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async update() {
        this.loading = true;

        var reqs = []
        reqs.push(this.loadFeriados());
        reqs.push(this.loadRoteiros());

        await Promise.all(reqs);

        this.loading = false;
    }

    prev() {
        this.fullCalendar.getApi().prev();
        this.loadRoteiros();
    }

    next() {
        this.fullCalendar.getApi().next();
        this.loadRoteiros();
    }

    today() {
        this.fullCalendar.getApi().today();
        this.loadRoteiros();
    }

    setCalendario() {
        let calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();
        let events: any[] = [];
        this.list.filter(x => x.active == true)
            .forEach(roteiro => {

                let color = this.calendarioUtils.setHexOpacity(roteiro.corLegenda, 20);

                let event = {
                    id: this.calendarioUtils.eventRandomId(),
                    title: roteiro.tema,
                    extendedProps: {
                        ...roteiro,
                        textColor: roteiro.corLegenda
                    },
                    start: moment(roteiro.dataInicio).startOf('day').toDate(),
                    end: moment(roteiro.dataFim).endOf('day').add(1, 'minute').toDate(),
                    backgroundColor: color,
                    borderColor: color,
                    textColor: roteiro.corLegenda
                    
                };
                events.push(event);
            });


        this.feriados.filter(x => x.active == true)
            .forEach(feriado => {

                // let color = this.calendarioUtils.setHexOpacity('#ff0000', 30);

                let event = {
                    id: this.calendarioUtils.eventRandomId(),
                    title: feriado.descricao,
                    start: moment(feriado.data).startOf('day').toDate(),
                    end: moment(feriado.data).endOf('day').add(1, 'minute').toDate(),
                    backgroundColor: '#ff0000',
                    borderColor: '#ff0000',
                    textColor: '#fff',
                    extendedProps: { 
                        evento_Tipo_Id: EventoTipo.Feriado,
                        ...feriado 
                    }
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

    eventMouseEnter(arg: EventHoveringArg) {
        let evento = arg.event.extendedProps as Roteiro;

        let backColor = this.calendarioUtils.setHexOpacity(evento.corLegenda, 70);
        let textColor = this.calendarioUtils.getTextColor(backColor);

        arg.event.setProp('backgroundColor', backColor)
        arg.event.setProp('borderColor', backColor)
        arg.event.setProp('textColor', textColor)
        arg.event.setExtendedProp('textColor', textColor)
    }

    eventMouseLeave(arg: EventHoveringArg) {
        let evento = arg.event.extendedProps as Roteiro;
        let color = this.calendarioUtils.setHexOpacity(evento.corLegenda, 30);
        let textColor = this.calendarioUtils.getTextColor(evento.corLegenda ?? '#fff');

        arg.event.setProp('backgroundColor', color)
        arg.event.setProp('borderColor', color)
        arg.event.setProp('textColor', '#2e2e2e')
        arg.event.setExtendedProp('textColor', evento.corLegenda)
    }

    async datesSet(arg: DatesSetArg) {
        this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);
        this.fullCalendar.getApi().updateSize();
        this.setCalendario();

    }

    edit(item: any) {
        if (item.evento_Tipo_Id == EventoTipo.Feriado) {
            let encrypted = this.crypto.encrypt(item.id);
            this.router.navigate(['feriado', encrypted], { relativeTo: this.activatedRoute });
        }
        else {
            this.roteiroService.setRoteiro(item);
            
            if (item.id == PseudoEvento.EventoId) {
                this.router.navigate(['cadastrar'], { relativeTo: this.activatedRoute });
            } else {
                let encrypted = this.crypto.encrypt(item.id);
                this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
            }
        }
    }


    loadRoteiros() {
        this.loading = true;
        let ano = this.fullCalendar.getApi().view.currentStart.getFullYear()
        return lastValueFrom(this.roteiroService.getList(ano))
    }

    loadFeriados() {
        this.loadingFeriados = true;
        return lastValueFrom(this.feriadoService.getList())
    }
}
