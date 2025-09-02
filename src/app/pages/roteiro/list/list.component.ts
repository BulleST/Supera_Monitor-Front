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
import { ContextMenu } from 'primeng/contextmenu';
import { Feriado } from '../../../models/feriado.model';
import { EventoService } from '../../../services/evento.service';
import { EventoTipo } from '../../../models/evento.model';
import { CalendarioUtils } from '../../../utils/calendario-utils';
import { ScreenWidth } from '../../../utils/mobile';

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
        // dayMaxEvents: 2,
        // dayMaxEventRows: false,
        datesSet: this.datesSet.bind(this),
        eventsSet: this.events.bind(this),
        eventMouseEnter: this.eventMouseEnter.bind(this),
        eventMouseLeave: this.eventMouseLeave.bind(this),
    }
    
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

        let screen = this.mobileService.get().subscribe(res => {
            this.calendarioOptions.multiMonthMaxColumns = (ScreenWidth.lg, ScreenWidth.xl).includes(res) ? 2 : 1
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

        let list = this.service.list.subscribe(res => {
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
        let anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().prev();
        let ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    async next() {
        let anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().next();
        let ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    async today() {
        let anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().today();
        let ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
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
        let calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();

        let events: any[] = [];

        // let roteirosDates = this.calendarioList.flatMap(x => {
        //     let length = moment(x.dataFim).diff(x.dataInicio)
        //     let range = Array.from({ length }, (item, index) => {
        //         return moment(x.dataInicio, 'YYYY-MM-DD').add(index, 'day').format('DD/MM/YY');
        //     });
        //     return range;
        // });
        // this.feriados.filter(x => !roteirosDates.includes(moment(x.date).format('DD/MM/YY')) ).forEach(item => {
        //     let event = {
        //         id: this.calendarioUtils.eventRandomId(),
        //         textColor: 'white',
        //         backgroundColor: 'red',
        //         borderColor: 'red',
        //         title: item.name,
        //         start: moment(item.date).toDate(),
        //         end: moment(item.date).toDate(),
        //         allDay: true,
        //         extendedProps: {
        //             id: PseudoEvento.EventoId,
        //             data: moment(item.date).toDate(),
        //             descricao: item.name,
        //             evento_Tipo_Id: EventoTipo.Feriado,
        //             ...item,
        //         },
        //     }

        //     events.push(event)
        // })
        this.calendarioList.filter(x => x.active == true)
            .forEach(x => {

                let color = this.calendarioUtils.setHexOpacity(x.corLegenda, 30);

                let event = {
                    id: this.calendarioUtils.eventRandomId(),
                    title: x.tema,
                    extendedProps: {
                        ...x,
                        textColor: x.corLegenda
                    },
                    start: moment(x.dataInicio).startOf('day').toDate(),
                    end: moment(x.dataFim).endOf('day').add(1, 'minute').toDate(),

                    // backgroundColor: x.corLegenda,
                    // borderColor: x.corLegenda,
                    // textColor: this.calendarioUtils.getTextColor(x.corLegenda ?? '#fff')
                    
                    // backgroundColor: 'var(--p-surface-50)',
                    // borderColor: 'var(--p-surface-50)',
                    // textColor: '#2e2e2e'

                    backgroundColor: color,
                    borderColor: color,
                    textColor: '#2e2e2e',
                    


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
            arg.event.setExtendedProp('textColor', evento.corLegenda)
    }

    eventMouseLeave(arg: EventHoveringArg) {
            let evento = arg.event.extendedProps as Roteiro;
            let color = this.calendarioUtils.setHexOpacity(evento.corLegenda, 30);
            let textColor = this.calendarioUtils.getTextColor(evento.corLegenda ?? '#fff');
            
            arg.event.setProp('backgroundColor', color)
            arg.event.setProp('borderColor', color)
            arg.event.setProp('textColor', '#2e2e2e')
            arg.event.setExtendedProp('textColor', evento.corLegenda)



            // arg.el.style.backgroundColor = color;
            // arg.el.style.borderColor = color;
            // arg.el.style.color = '#2e2e2e';
    }

    async datesSet(arg: DatesSetArg) {
        this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);
        this.fullCalendar.getApi().updateSize();
        this.setCalendario();
    }

    edit(item: any) {
        let encrypted = this.crypto.encrypt(item.id);
        this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
    }


    loadCalendario() {
        this.loading = true;
        return lastValueFrom(this.service.getList())
            .then(res => {
                this.loading = false;
                this.calendarioList = res;
                this.setCalendario();
            }).catch(res => {
                this.loading = false;
            })
    }

    loadFeriados() {
        this.loadingFeriados = true;
        let ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        return lastValueFrom(this.eventoService.getFeriados(ano))
            .then(res => {
                res.forEach(item => {
                    let index = this.feriados.findIndex(x => moment(x.date).isSame(item.date))
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
