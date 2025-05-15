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
        private confirmationService: ConfirmationService,
        private service: RoteiroService,
        private eventoService: EventoService,
        private mobileService: MobileService,
        private header: Header,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
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
            if (res.length > 0) {
                this.calendarioList = res;
                this.setCalendario();
            }
        });
        this.subscription.push(list);

        
        
    }
    ngAfterViewInit(): void {
        this.update()

        // $(`button:contains('cadastrar')`)
        // .removeClass('fc-button fc-button-primary')
        // .addClass('p-ripple p-button bi bi-plus text-base p-button-primary p-button-rounded p-button-sm h-full px-3')

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
        console.log(this.fullCalendar.getApi().view.activeStart.getFullYear())
        var anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().prev();
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        console.log(this.fullCalendar.getApi().view.activeStart.getFullYear())
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    async next() {
        console.log(this.fullCalendar.getApi().view.activeStart.getFullYear())
        var anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().next();
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        console.log(this.fullCalendar.getApi().view.activeStart.getFullYear())
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
    }

    async today() {
        console.log(this.fullCalendar.getApi().view.activeStart.getFullYear())
        var anoPrev = this.fullCalendar.getApi().view.activeStart.getFullYear();
        this.fullCalendar.getApi().today();
        var ano = this.fullCalendar.getApi().view.activeStart.getFullYear();
        console.log(this.fullCalendar.getApi().view.activeStart.getFullYear())
        if (anoPrev != ano) {
            await this.loadFeriados();
            this.setCalendario();
        }
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

        {
            label: 'Excluir',
            icon: 'fa-solid fa-trash text-red-500',
            command: () => this.edit(item)
        },

        ];

    }
    setCalendario() {
        
        var events: any[] = []; 
        this.feriados.forEach(item => {
            var event = {
                id: this.eventRamdomId(),
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
                    id: this.eventRamdomId(),
                    title: x.tema,
                    extendedProps: x,
                    start: x.dataInicio,
                    end: x.dataFim,
                    backgroundColor: x.corLegenda,
                    borderColor: x.corLegenda,
                    textColor: this.getForeColor(x.corLegenda ?? '#fff')
                };
                events.push(event);
            });
            

        this.calendarioOptions.events = [];
        this.calendarioOptions.events = events;
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
        this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);
        this.fullCalendar.getApi().updateSize();
        this.setCalendario();
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
