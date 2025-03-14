import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Jornada, jornadas } from '../../../models/jornada.model';
import { JornadaService } from '../../../services/jornada.service';
import { lastValueFrom, Subscription } from 'rxjs';
import 'moment/locale/pt-br'

import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import { VerboseFormattingArg } from '@fullcalendar/core/internal';
import multiMonthPlugin from '@fullcalendar/multimonth';
import dayGridPlugin from '@fullcalendar/daygrid';

import listPlugin from '@fullcalendar/list';
import { Crypto, Header, MobileService } from '../../../utils';
import { FullCalendarComponent } from '@fullcalendar/angular';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import $ from 'jquery';
import { ContextMenu } from 'primeng/contextmenu';

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
    currentTitle = '';
    calendarioList: Jornada[] = [];
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
        startParam: '2025-01-01',
        dayHeaders: true,
        weekends: false,
        // weekNumberCalculation: (m: Date) => {
        //     const weekNumber = this.getDateWeek(m, new Date(2025, 1, 10));
        //     return weekNumber;
        // },
        height: '438px',
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        defaultAllDay: false,
        allDaySlot: false,
        dayHeaderFormat: {weekday: 'long'},
        customButtons: {
            // atualizar: {
            //     text: 'atualizar',
            //     hint: 'atualizar',
            //     click: () => {
            //         this.update();
            //         // this.getCalendario({}, 'atualizar')
            //     }
            // },
            // cadastrar: {
            //     text: 'cadastrar',
            //     hint: 'cadastrar',
            //     click: () => {
            //         this.router.navigate(['jornada', 'cadastrar'])
            //     }
            // }

        },
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        nowIndicator: true,
        dayMaxEvents: true,
        events: [],
        scrollTime: '08:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        buttonText: {
            today: 'hoje',
            year: 'meses',
            month: 'mês',
            week: 'semana',
            day: 'dia',
            list: 'lista'
        },
        // titleFormat: (arg: VerboseFormattingArg) => {
        //     // const weekNumber = this.getDateWeek(arg.start.marker, new Date(2025, 1, 10));
        //     return [`Jornada Superaaaaa <b></b>`]
        // },
        weekNumbers: false,
        // weekNumberContent: (arg) => {

        //     var date = moment(arg.date).add(1, 'day').toDate()
        //     var jornada = this.calendarioList.find(x => x.dataInicio.toLocaleDateString() == date.toLocaleDateString())
        //     console.log('jornada', jornada)

        //     return  jornada ? 'Semana ' + jornada.semana : '';
        // },
        lazyFetching: true,
        datesSet: this.datesSet.bind(this),
        // dateClick: this.dateClick.bind(this),
        eventsSet: this.events.bind(this),
        // eventMouseEnter: this.eventMouseEnter.bind(this),
        // eventMouseLeave: this.eventMouseLeave.bind(this),

    }
    items: MenuItem[] = []
    constructor(
        private changeDetector: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private service: JornadaService,
        private mobileService: MobileService,
        private header: Header,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
    ) {

        this.calendarioList = jornadas;

        this.setCalendario();
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
            if (res.length > 0) {
                this.calendarioList = res;
                this.setCalendario();
            }
        });
        this.subscription.push(list);

        this.update()


    }
    ngAfterViewInit(): void {

        // console.log($(`button:contains('cadastrar')`))
        // $(`button:contains('cadastrar')`)
        // .removeClass('fc-button fc-button-primary')
        // .addClass('p-ripple p-button bi bi-plus text-base p-button-primary p-button-rounded p-button-sm h-full px-3')

    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    update() {
        this.loading = true;
        this.service.getList().subscribe({
            next: res => {
                this.loading = false;
                this.calendarioList = res;
                this.setCalendario();
            },
            error: res => {
                this.loading = false;
            },
        })
    }

    prev() {
        this.fullCalendar.getApi().prev()
    }

    next() {
        this.fullCalendar.getApi().next()
    }
    
    today() {
        this.fullCalendar.getApi().today()
    }

    getForeColor(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var rgb = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {
            r: 0,
            g: 0,
            b: 0
        };
        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 150 ? '#232323' : '#fff';
    }
    contextMenuShow(contexMenu: ContextMenu, item: Jornada, e: any) {
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
       
        {
            label: 'Excluir',
            icon: 'fa-solid fa-trash text-red-500',
            command: () => this.edit(item)
        },
       
        ];

    }
    setCalendario() {
        this.calendarioOptions.events = [];
        this.calendarioOptions.events = this.calendarioList
            // .filter(x => x.active == true)
            .map(x => ({
                id: this.eventRamdomId(),
                title: x.tema,
                extendedProps: x,
                start: x.dataInicio,
                end: x.dataFim,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
            }));
    }

    eventRamdomId() {
        let length = 5;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }


    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }
    async datesSet(arg: DatesSetArg) {
        this.currentTitle = moment(arg.start).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)
        this.fullCalendar.getApi().updateSize();
        this.loading = true;
        this.calendarioList = jornadas;
        this.setCalendario();
        this.loading = false;

    }
    edit(item: any) {
        var encrypted = this.crypto.encrypt(item.id);
        this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
    }
    deactivated(e: any, item: any) {
        var deactivated = !item.active;
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} o professor selecionado? 
                          ${deactivated ? 'Esse usuário poderá acessar novamente a plataforma.' : 'Esse usuário será deslogado e não poderá acessar novamente enquanto estiver inativo.'} `,
            header: deactivated ? 'Habilitar' : 'Desabilitar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: `${deactivated ? 'Habilitar' : 'Desabilitar'}`,
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                // lastValueFrom(this.service.deactivated(item.id, deactivated))
                //     .then(res => {
                //         if (res.success) {
                //             item.active = res.object.active;
                //             item.deactivated = res.object.deactivated;
                //             insertOrReplace(this.service, item);
                //             item = res.object;
                //         } else {
                //             setTimeout(() => {
                //                 this.showError(res.message, e);
                //             }, 300);
                //         }
                //     })
                //     .catch(res => {
                //         this.showError(res.error.message, e);
                //     })
            },
        });
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Erro',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        });
    }

    getWeekColor(arg: any) {
        console.log(arg)
    }
}
