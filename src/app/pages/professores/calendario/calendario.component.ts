import { ChangeDetectorRef, Component, signal, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarioRequest } from '../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Popover } from 'primeng/popover';
import { EventImpl } from '@fullcalendar/core/internal';
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import moment from 'moment';
import { Professor } from '../../../models/professor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { Crypto } from '../../../utils';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { Feriado } from '../../../models/feriado.model';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService],
})
export class CalendarioComponent {
    visible: boolean = false;
    subscription: Subscription[] = [];
    loading = false;
    object: Professor = new Professor;

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano = new Date().getFullYear();
    currentTitle = '';


    calendarVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: Evento[] = [];
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
        ],
        dayMaxEvents: 3,
        dayHeaders: true,
        weekends: true,
        hiddenDays: [0],
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        eventsSet: this.events.bind(this),
        datesSet: async (arg: DatesSetArg) => {
            this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY');
            this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);
    
            this.calendarioRequest.intervaloDe = arg.view.currentStart;
            this.calendarioRequest.intervaloAte = arg.view.currentEnd;
    
            if (this.ano != this.calendarioRequest.intervaloDe.getFullYear() || this.feriados.length == 0) {
                this.ano == this.calendarioRequest.intervaloDe.getFullYear();
                await this.loadFeriados();
            }
            
            if (this.object.id) {
                await this.getCalendario();
                this.setCalendario();
            }
        },
    }

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private service: EventoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private professorService: ProfessorService,
        private crypto: Crypto,
    ) {
        var params = this.activatedRoute.params.subscribe(async res => {
            if (res['id']) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.professorService.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;

                        this.calendarVisible.set(true);
                        this.calendarioRequest.professor_Id = res.id;
                        this.calendarioRequest.intervaloDe = moment().startOf('month').toDate();
                        this.calendarioRequest.intervaloAte = moment().endOf('month').toDate();
                    })
                    .catch(res => {
                        this.visible = false;
                        this.visibleChange();
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);

    }



    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
    }



    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }
    
        async update(where: string) {
            await this.loadFeriados();
            await this.getCalendario();
            this.setCalendario();
        }
    
        prev() {
            this.fullCalendar.getApi().prev();
        }
        
        next() {
            this.fullCalendar.getApi().next();
        }
        
        async today() {
            this.fullCalendar.getApi().today();
            
            this.calendarioRequest.intervaloDe = moment().startOf('week').toDate();
            this.calendarioRequest.intervaloAte = moment().endOf('week').toDate();
    
            await this.getCalendario( );
            this.setCalendario();
        }
    

    async getCalendario() {

        this.loading = true; 

        await lastValueFrom(this.service.calendario(this.calendarioRequest))
            .then(calendarioList => {
                this.calendarioList = calendarioList.filter(x => x.active == true);
            })
            .catch(res => {
                this.loading = false;
            })
    }


    setCalendario() {
        this.loading = true;
        
                var feriadosDates = this.feriados.map(x => moment(x.date).format('YYYY-MM-DD'));
                var eventos = this.calendarioList.filter(x => x.active == true && x.professores.map(y=>y.professor_Id).includes(this.object.id) /*&& feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false  */);
        
                var events = eventos.map(item => {
                                        var backgroundColor = '#2e2e2e';
                                        if (item.corLegenda) {
                                            backgroundColor = item.corLegenda;
                                        } 
                                        else if (item.evento_Tipo_Id == EventoTipo.Reuniao) {
                                            backgroundColor = '#f37435' // primary color
                                        }
                                        else if (item.professores && item.professores.length > 0) {
                                            backgroundColor = item.professores[0].corLegenda;
                                        }
                                        console.log('backgroundColor', backgroundColor, item.corLegenda)
                                        var color = this.getForeColor(backgroundColor)
                                        var event: any = {
                                            id: this.eventRamdomId(),
                                            backgroundColor: backgroundColor,
                                            borderColor: backgroundColor,
                                            foreColor: color,
                                            title: item.turma ?? item.descricao,
                                            start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                                            end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                                            extendedProps: item,
                                        }
                                        return event;
                                    });
        
                this.feriados.forEach(item => {
                    var event = {
                        id: this.eventRamdomId(),
                        foreColor: 'white',
                        backgroundColor: 'red',
                        borderColor: 'red',
                        title: item.name,
                        start: moment(item.date).toDate(),
                        end: moment(item.date).toDate(),
                        allDay: true,
                        extendedProps: item,
                        feriado: true,
                    }
                    events.push(event)
                })
                this.calendarioOptions.events = events;
        
        setTimeout(() => {
            this.fullCalendar.getApi().render();
        }, 100);

        this.loading = false;
    }
    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
    }
    getForeColor(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var rgb = result ? {
            r: parseInt(result[1], 16), g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {
            r: 0,
            g: 0,
            b: 0
        };
        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 180 ? '#2e2e2e' : '#fff';
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


    goToProfessor() {
        this.router.navigate(['professores', 'editar', this.crypto.encrypt(this.object.id)]);
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        await lastValueFrom(this.service.getFeriados(this.ano))
        .then(res => {
            this.feriados = res;
            this.loadingFeriados = false;
        })
        .catch(res => this.loadingFeriados = false);
    }
}
