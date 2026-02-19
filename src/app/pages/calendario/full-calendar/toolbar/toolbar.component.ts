import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CalendarioDayView, CalendarioRequest, CalendarioView } from '../../../../models/calendario.model';
import { EventoService } from '../../../../services/evento.service';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import {  Router } from '@angular/router';
import { MobileService } from '../../../../utils';
import { ScreenWidth } from '../../../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';
import { NgModel } from '@angular/forms';
import { Roteiro } from '../../../../models/roteiro.model';
import moment from 'moment';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { RoteiroService } from '../../../../services/roteiro.service';

@Component({
    selector: 'app-toolbar',
    standalone: false,
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.css',
})
export class ToolbarComponent implements OnChanges, OnDestroy {
    @Input() fullCalendar!: FullCalendarComponent;
    @Input() calendarioRequest!: CalendarioRequest;
    @Input() loading!: boolean;
    @Output() update = new EventEmitter<CalendarioRequest>();
    @Output() dayViewOnChange = new EventEmitter<CalendarioDayView>();
    
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth = ScreenWidth;
    subscription: Subscription[] = [];
    
    CalendarioDayView = CalendarioDayView;
    dayView: CalendarioDayView = CalendarioDayView.Semana;
    view: CalendarioView = CalendarioView.CalendarioGeral;
    viewMenu: MenuItem[] = [
        {
            label: 'Calendário Geral',
            value: CalendarioView.CalendarioGeral,
            icon: 'pi pi-calendar',
        },
        {
            label: 'Meu Calendário',
            value: CalendarioView.MeuCalendario,
            icon: 'pi pi-user',
        },
    ];

    agendarValue?: MenuItem;
    agendarMenuItem: MenuItem[] = [
        {
            label: 'Aula 0',
            routerLink: 'calendario/agendar/aula-zero',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.AulaZero;
                this.service.setEvento(evento);
            }
        }, {
            label: 'Aula 1',
            routerLink: 'calendario/agendar/primeira-aula',
            command: () => {
                this.service.setEvento(undefined);
            }
        },
        {
            label: 'Falta',
            routerLink: 'calendario/agendar/falta',
            command: () => {
                this.service.setEvento(undefined);
            }
        },
        {
            label: 'Oficina',
            routerLink: 'calendario/agendar/oficina',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Oficina;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Reunião',
            routerLink: 'calendario/agendar/reuniao',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Reuniao;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Reposição',
            routerLink: 'calendario/agendar/reposicao',
            command: () => {
                this.service.setEvento(undefined);
            }
        },
        {
            label: 'Superação',
            routerLink: 'calendario/agendar/superacao',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Superacao;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Turma Extra',
            routerLink: 'calendario/agendar/turma-extra',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.TurmaExtra;
                this.service.setEvento(evento);
            }
        },
    ];
    
    currentTitle: string = '';

    currentRoteiroTitle: string = '';
    currentRoteiro?: Roteiro;
    roteiros: Roteiro[] = [];
    loadingRoteiro = false;
    
    data = new Date;
    minData = new Date(2024, 0, 1);
    loadedAnos: number[] = [];


    constructor(
        private service: EventoService,
        private mobileService: MobileService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private roteiroService: RoteiroService,

    ) {
        this.agendarMenuItem.sort((x,y) => x.label! < y.label! ? -1 : 1)

        let screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res.sort((x, y) => x.dataInicio.getTime() - y.dataInicio.getTime());
            this.getTemaSemana();
        });
        this.subscription.push(roteiros);

        this.updateCalendar();

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fullCalendar']) {
            this.fullCalendar = changes['fullCalendar'].currentValue;
            this.setTitle();
            this.getTemaSemana();
        }
        if (changes['calendarioRequest']) {
            this.calendarioRequest = changes['calendarioRequest'].currentValue;
        }
        if (changes['loading']) {
            this.loading = changes['loading'].currentValue;
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    updateCalendar() {
        this.requestLoadRoteiros();
        this.update.emit(this.calendarioRequest)
        this.getTemaSemana();
    }

    calendarViewChanged() {
        this.service.calendarView.emit(this.view);
    }

    setTitle() {
        let date = this.data;
        this.currentTitle = moment(date).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);
        
    }

    agendarEvento(e: SelectChangeEvent, select: NgModel) {

        if (this.agendarValue) {
            if (this.agendarValue.command) {
                this.agendarValue.command(e);
            }
            this.router.navigateByUrl(this.agendarValue.routerLink);

            delete this.agendarValue;
            select.control.setValue(undefined)
            select.control.updateValueAndValidity();

            this.cdr.markForCheck(); // Marca para verificação na próxima detecção
            this.cdr.detectChanges()
        }
    }

    roteiroChanged() {
        if (this.currentRoteiro) {
            if (moment(this.currentRoteiro.dataInicio).week() != moment(this.calendarioRequest.intervaloDe).week()) {
                this.data = this.currentRoteiro.dataInicio;
                this.calendarioRequest.intervaloDe = moment(this.data).day(1).toDate();
                this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
                this.setTitle();
                this.getTemaSemana();
                this.setData()
            }
        }
    }

    getData() {
        let data = localStorage.getItem('data');
        if (data) {
            this.data = moment(data).toDate();
        }
        else {
            this.data = new Date();
            this.setData()
        }
        
        if (this.fullCalendar && this.fullCalendar.getApi()) {
            this.fullCalendar.getApi().gotoDate(this.data)

        }
    }

    setData() {
        localStorage.setItem('data', moment(this.data).format('YYYY-MM-DD'))
    }
        
    prev() {
        let api = this.fullCalendar.getApi();
        api.prev();
        this.data = api.view.activeStart;
        this.setTitle();
        this.getTemaSemana();
        this.setData();
    }

    next() {
        let api = this.fullCalendar.getApi();
        api.next();
        this.data = this.fullCalendar.getApi().view.activeStart;
        this.setTitle();
        this.getTemaSemana();
        this.setData();
    }

    today() {
        let api = this.fullCalendar.getApi();
        api.today();
        this.data = api.view.activeStart;
        this.setTitle();
        this.getTemaSemana();
        this.setData();
    }

    dataChanged(model: NgModel) {
        if (model.dirty && model.touched) {
            // Se for exibição diária
            if (this.dayView) {
                this.calendarioRequest.intervaloDe = this.data;
                this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
                this.setTitle();
                this.getTemaSemana();
            }
            // Se for exibição da semana
            else {
                if (moment(this.data).week() != moment(this.calendarioRequest.intervaloDe).week()) {
                    this.calendarioRequest.intervaloDe = moment(this.data).day(1).toDate();
                    this.calendarioRequest.intervaloAte = moment(this.calendarioRequest.intervaloDe).add(7, 'days').toDate();
                    this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
                    this.setTitle();
                    this.getTemaSemana();
                }
            }

            model.control.markAsUntouched();
            model.control.markAsPristine();
        }
        this.setData();
    }

    getTemaSemana() {
        let data = this.data;
        let roteiro = this.roteiros.find(x => moment(data).isBetween(x.dataInicio, x.dataFim, undefined, '[]'));
        if (roteiro) {
            this.currentRoteiro = roteiro;
            this.currentRoteiroTitle = `Semana ${roteiro.semana} - ${roteiro.tema} `
        } else {
            this.currentRoteiro = undefined;
            this.currentRoteiroTitle = 'Indefinido'
        }
    }

    calendarDayViewChanged() {
        if (this.dayView == CalendarioDayView.Dia) {
            this.dayView = CalendarioDayView.Semana;
        } else {
            this.dayView = CalendarioDayView.Dia;
        }

        this.dayViewOnChange.emit(this.dayView);
        this.setData();

    }

    requestLoadRoteiros() {
        this.loadingRoteiro = true;
        let ano = this.data.getFullYear();
        return lastValueFrom(this.roteiroService.getList(ano))
            .then(res => {
                this.loadingRoteiro = false;
                this.getTemaSemana()
            })
            .catch(res => this.loadingRoteiro = false)
    }


}
