import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Crypto } from '../../../utils';
import { CalendarOptions, DatesSetArg, EventApi, EventClickArg } from '@fullcalendar/core';
import { AulaService } from '../../../services/aulas.service';
import moment from 'moment';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { CalendarioList, CalendarioRequest } from '../../../models/calendario.model';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno } from '../../../models/alunos.model';
import { Reposicao, ReposicaoRequest } from '../../../models/reposicao.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventImpl } from '@fullcalendar/core/internal';
import { AulaCreateRequest } from '../../../models/aulas.model';

@Component({
    selector: 'app-reposicao',
    standalone: false,
    templateUrl: './reposicao.component.html',
    styleUrl: './reposicao.component.css',
    providers: [ConfirmationService, MessageService],
})
export class ReposicaoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = true;
    object: Reposicao = new Reposicao;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    legenda: { backgroundColor: string, label: string }[] = [];
    request: CalendarioRequest = new CalendarioRequest;

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    selectedAula?: EventImpl;
    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: CalendarioList[] = []
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
            multiMonthPlugin
        ],
        dayMaxEvents: 3,
        multiMonthMaxColumns: 1,// force a single column,
        views: {
            multiMonthFourMonth: {
                type: 'multiMonth',
                duration: { months: 4 }
            }
        },
        dayHeaders: true,
        weekends: false,
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        defaultAllDay: false,
        allDaySlot: false,
        headerToolbar: {
            left: 'title',
            center: '',
            right: 'today prev next'
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        lazyFetching: true,
        eventClick: this.eventClick.bind(this),
        eventsSet: this.events.bind(this),
        datesSet: (arg: DatesSetArg) => {
        
            this.request.intervaloDe = new Date(arg.start.getTime());
            this.request.intervaloAte = undefined;

            this.getCalendario(this.request);
        },
    }

    aluno: Aluno = new Aluno;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: AulaService,
        private changeDetector: ChangeDetectorRef,
        private alunoService: AlunoService,
        private confirmationService: ConfirmationService,
    ) {

        var list = this.service.list.subscribe(res => this.calendarioList = res);
        this.subscription.push(list);

        var encrypted = localStorage.getItem('reposicao');
        if (!encrypted) {
            this.visible = false;
            this.visibleChange();
            return;
        }
        this.object = this.crypto.decrypt(encrypted) as Reposicao;
        if (!this.object) {
            this.visible = false;
            this.visibleChange();
            return;
        }

        this.loadAluno();

        this.request.intervaloDe = moment(this.object.source_Data).add(-1, 'month').toDate();
        this.request.intervaloAte = moment(this.object.source_Data).add(1, 'month').toDate();
        this.request.turma_Tipo_Id = this.object.source_Turma_Tipo_Id;
        
        this.getCalendario(this.request);

        var params = this.activatedRoute.params.subscribe(res => {
            if (!res['aluno_id']) {
                this.visible = false;
                this.visibleChange();
                return;
            }
        })
        this.subscription.push(params);
    }

    
    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            var route = ['../../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    async loadAluno() {
        this.loading = true;
        if (this.alunoService.list.value.length == 0) {
            await lastValueFrom(this.alunoService.getList());
        }
        this.aluno = await this.alunoService.get(this.object.aluno_Id);
        if (!this.aluno) {
            this.visible = false;
            this.visibleChange();
        }
        this.loading = false;
    }

    async getCalendario(request: CalendarioRequest) {

        this.loading = true;

        await lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {

                calendarioList
                .filter(x => x.alunos.length < x.capacidadeMaximaAlunos && x.data >= new Date)
                .forEach(aula => {
                    var f = moment(aula.data).format('DD/MM/YYYY HH:mm');
                    var index = this.calendarioList.findIndex(x => x.turma_Id == aula.turma_Id && moment(x.data).format('DD/MM/YYYY HH:mm') == f);
                    if (index == -1){
                        this.calendarioList.push(aula);
                    }
                    else {
                        this.calendarioList.splice(index, 1, aula);
                    }

                })
                this.calendarioList.sort((x, y) => (x.data > y.data ? -1 : 1));

                this.setCalendario();
                this.setLegenda(this.calendarioList);
            })
            .catch(res => {
                this.loading = false;
            })

    }

    setCalendario() {
        this.loading = true;
        this.calendarioOptions.events = this.calendarioList.map(item => {
            var event = {
                id: this.eventRamdomId(),
                backgroundColor: item.corLegenda,
                borderColor: item.corLegenda,
                title: item.turma,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                data: item,
            }
            return event;
        });

        this.loading = false;
    }

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
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
        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 200 ? '#000' : '#fff';
    }


    setLegenda(c: CalendarioList[]) {
        this.legenda = [];
        c.forEach(item => {
            if (!this.legenda.find(x => x.backgroundColor == item.corLegenda && x.label == item.professor)) {
                this.legenda.push(
                    {
                        label: item.professor,
                        backgroundColor: item.corLegenda,
                    }
                )
            }
        })
        var calendar = this.fullCalendar.getApi();

        calendar.gotoDate(this.calendarioList[0].data)
    }


    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
    }

    eventClick(e: EventClickArg) {
        this.confirmationService.confirm({
            target: e.jsEvent.target ?? undefined,
            message: `Selecionar aula do dia <b class="text-primary-500">${moment(e.event.start).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${e.event.extendedProps['data'].turma}</b> com o professor <b>${e.event.extendedProps['data'].professor}</b>?`,
            header: 'Selecionar aula',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Selecionar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.selectedAula = e.event;
            },
            reject: () => {
            }
        });
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
    
    confirmaReposicao(e: any) {

        var target = this.selectedAula!.extendedProps['data'] as CalendarioList;

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja marcar reposição do aluno <b>${this.object.aluno} </b> do dia <b>${moment(this.object.source_Data).format('DD/MM/YYYY [às] HH[h]mm')}</b> para o dia <b class="text-primary-500">${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${target.turma}</b> com o professor <b>${target.professor}</b>?`,
            header: 'Agendar reposição',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Selecionar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: () => {
                this.send(target)
            },
            reject: () => {
            }
        });
    }


    async send(target: CalendarioList) {

        this.loading = true;

        var reposicaoRequest = new ReposicaoRequest;
        reposicaoRequest.aluno_Id = this.object.aluno_Id;

        // Se a aula source não existir, cria a aula
        if (!this.object.source_Aula_Id) {
            var aulaRequest: AulaCreateRequest = {
                turma_Id: this.object.source_Turma_Id,
                data: moment(this.object.source_Data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: this.object.source_Professor_Id
            }
            var aulaResponse = await lastValueFrom(this.service.create(aulaRequest))
            reposicaoRequest.source_Aula_Id = aulaResponse.object.id;
        }

        // Se a aula target não existir, cria a aula
        if (!target.aula_Id) {
            var aulaRequest: AulaCreateRequest = {
                turma_Id: target.turma_Id,
                data: moment(target.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: target.professor_Id
            }
            var aulaResponse = await lastValueFrom(this.service.create(aulaRequest))
            reposicaoRequest.dest_Aula_Id = aulaResponse.object.id;
        }

        await lastValueFrom(this.alunoService.reposicao(reposicaoRequest))
            .then(res => {
                this.loading = false;
                this.selectedAula = undefined;

                this.visible = false;
                this.visibleChange();

                
            })
            .catch(res => {
                this.loading = false;
            })
    }


}

