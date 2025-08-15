import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CalendarioRequest, CalendarioView } from '../../../../models/calendario.model';
import { EventoService } from '../../../../services/evento.service';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ActivatedRoute, Router } from '@angular/router';
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
    @Output() update = new EventEmitter<boolean>();
    
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth = ScreenWidth;
    subscription: Subscription[] = [];
    
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
            routerLink: 'calendario/aula-zero/agendar',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.AulaZero;
                this.service.setEvento(evento);
            }
        }, {
            label: 'Aula 1',
            routerLink: 'calendario/primeira-aula/agendar',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Aula;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Turma Extra',
            routerLink: 'calendario/turma-extra/agendar',
            command: () => {
                let evento = new Evento;
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
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Superacao;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Oficina',
            routerLink: 'calendario/oficina/agendar',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Oficina;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Reunião',
            routerLink: 'calendario/reuniao/agendar',
            command: () => {
                let evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Reuniao;
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
    minData = new Date(2025, 0, 1);
    loadedAnos: number[] = [];
    dayView = false;


    constructor(
        private service: EventoService,
        private mobileService: MobileService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private roteiroService: RoteiroService,

    ) {

        let screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res.sort((x, y) => x.dataInicio.getTime() - y.dataInicio.getTime());
            this.getTemaSemana();
        });
        this.subscription.push(roteiros);

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fullCalendar']) {
            this.fullCalendar = changes['fullCalendar'].currentValue;
            this.setTitle();
            this.getTemaSemana();

        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    updateCalendar() {
        this.requestLoadRoteiros();
        this.update.emit(true)
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
            }
        }
    }
    prev() {
        this.fullCalendar.getApi().prev();
        this.data = this.fullCalendar.getApi().getDate();
        this.setTitle();
        this.getTemaSemana();
    }

    next() {
        this.fullCalendar.getApi().next();
        this.data = this.fullCalendar.getApi().getDate();
        this.setTitle();
        this.getTemaSemana();
    }

    today() {
        this.fullCalendar.getApi().today();
        this.data = new Date();
        this.setTitle();
        this.getTemaSemana();
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
    }

    getTemaSemana() {
        console.log('getTemaSemana', this.roteiros)
        let data = this.data;
        let roteiro = this.roteiros.find(x => moment(data).isBetween(x.dataInicio, x.dataFim, undefined, '[]'));
        console.log('data', data)
        console.log('roteiro', roteiro)
        if (roteiro) {
            this.currentRoteiro = roteiro;
            this.currentRoteiroTitle = `Semana ${roteiro.semana} - ${roteiro.tema} `
        } else {
            this.currentRoteiro = undefined;
            this.currentRoteiroTitle = 'Indefinido'
        }
    }

    requestLoadRoteiros() {
        this.loadingRoteiro = true;
        return lastValueFrom(this.roteiroService.getList('loadRoteiros'))
            .then(res => {
                this.loadingRoteiro = false;
                this.getTemaSemana()
            })
            .catch(res => this.loadingRoteiro = false)
    }


}
